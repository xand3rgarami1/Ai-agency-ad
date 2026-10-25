"""Build every audio stem for the ad.

    python3 audio/build_audio.py            # narration + music + sfx
    python3 audio/build_audio.py --skip-vo  # keep the existing narration

All music and sound effects are synthesised here from scratch (no samples), so they
are original and license-free. Cue times come from src/config/timeline.json, the
same file the Remotion scenes read, so picture and sound stay locked.

Outputs (48 kHz, 24-bit):
    public/audio/vo.wav          raw narration (from build_voiceover.py)
    public/audio/stem_*.wav      balanced vo / music / sfx stems at -6 dB, for re-mixing
    public/audio/mix.wav         mastered mix the composition plays:
                                 ~-14 LUFS integrated, peaks limited to -1.2 dBFS
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, "public", "audio")
SR = 48000
DUR = float(json.load(open(os.path.join(ROOT, "src", "config", "timeline.json")))["format"]["duration"])
N = int(SR * DUR)
RNG = np.random.default_rng(7)  # deterministic

TARGET_LUFS = -14.0


# ----------------------------------------------------------------- timeline
def load_timeline():
    plan = json.load(open(os.path.join(ROOT, "src", "config", "timeline.json")))
    gen = json.load(open(os.path.join(ROOT, "src", "config", "timeline.generated.json")))
    lines = {l["id"]: l for l in gen["lines"]}

    def resolve(a):
        at, off = a["at"], a.get("offset", 0.0)
        if isinstance(at, (int, float)):
            return at + off
        kind, key = at.split(":")
        if kind == "scene":
            return resolve(plan["scenes"][key]) + off
        l = lines[kind]
        if key == "end":
            return l["end"] + off
        if key == "start":
            return l["start"] + off
        return l["words"][int(key)]["start"] + off

    scenes = {k: resolve(v) for k, v in plan["scenes"].items() if not k.startswith("_")}
    cues = [dict(c, t=resolve(c)) for c in plan["cues"]]
    return scenes, cues


# ----------------------------------------------------------------- dsp helpers
def tt(d):
    return np.arange(int(d * SR)) / SR


def env_ad(d, a=0.005, curve=6.0):
    t = tt(d)
    e = np.exp(-curve * t / d)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def sweep_filter(x, f0, f1, kind="low"):
    """Time-varying one-pole filter (cutoff glides exponentially f0 -> f1)."""
    n = len(x)
    f = f0 * (f1 / f0) ** (np.arange(n) / max(1, n - 1))
    a = np.exp(-2 * np.pi * f / SR)
    y = np.empty(n)
    s = 0.0
    for i in range(n):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y if kind == "low" else x - y


def noise(d):
    return RNG.standard_normal(int(d * SR))


def place(bus, sig, t, gain=1.0, pan=0.0):
    """Add mono or stereo `sig` into stereo `bus` at time t (s)."""
    i0 = int(round(t * SR))
    if i0 >= len(bus):
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], axis=1)
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    n = min(len(sig), len(bus) - i0)
    bus[i0:i0 + n] += sig[:n] * gain


def reverb_ir(d=1.6, decay=3.2, seed=3):
    r = np.random.default_rng(seed)
    t = tt(d)
    ir = np.stack([r.standard_normal(len(t)), r.standard_normal(len(t))], axis=1) * np.exp(-decay * t)[:, None]
    ir[:, 0] = lp(ir[:, 0], 6000)
    ir[:, 1] = lp(ir[:, 1], 6000)
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def add_reverb(x, wet=0.25, d=1.6, decay=3.2):
    ir = reverb_ir(d, decay)
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x + wet * y


def layer(*sigs):
    """Sum mono signals of different lengths (aligned at t=0)."""
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs:
        out[: len(x)] += x
    return out


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ----------------------------------------------------------------- instruments
def pad_voice(freq, d, bright=6.0, attack=0.5, release=0.8):
    """Warm detuned additive saw, stereo."""
    t = tt(d)
    out = np.zeros((len(t), 2))
    for k, (det, pan) in enumerate([(-7, -0.7), (0, 0.0), (7, 0.7)]):
        f = freq * 2 ** (det / 1200)
        ph = RNG.uniform(0, 2 * np.pi)
        v = np.zeros(len(t))
        for h in range(1, 14):
            if f * h > 9000:
                break
            v += np.sin(2 * np.pi * f * h * t + ph * h) / h * np.exp(-h / bright)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        out[:, 0] += v * l
        out[:, 1] += v * r
    e = np.ones(len(t))
    na, nr = int(attack * SR), int(release * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return out * e[:, None] / 3


def pluck(freq, d=0.35, bright=4.0):
    t = tt(d)
    v = sum(np.sin(2 * np.pi * freq * h * t) / h * np.exp(-h / bright) for h in range(1, 7))
    return v * env_ad(d, 0.003, 9)


def kick(d=0.4, gain=1.0):
    t = tt(d)
    f = 45 + 75 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * gain


def hat(d=0.05):
    return hp(noise(d), 7000) * env_ad(d, 0.001, 7) * 0.5


def sub(freq, d):
    t = tt(d)
    v = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    e = np.minimum(1, t / 0.01) * np.exp(-t * 1.6)
    return v * e


def bell(freq, d=1.2):
    t = tt(d)
    v = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 6) + 0.2 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 12)
    return v * env_ad(d, 0.002, 5)


# ----------------------------------------------------------------- sfx
def sfx_impact(soft=False):
    d = 1.8
    t = tt(d)
    f = 38 + 70 * np.exp(-t * 10)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (3.2 if not soft else 4.5))
    crack = lp(noise(d), 2500) * np.exp(-t * 22) * 0.6
    air = bp(noise(d), 300, 3000) * np.exp(-t * 5) * 0.12
    x = body + crack + air
    return x * (0.55 if soft else 1.0)


def sfx_whoosh(d=0.45, f0=400, f1=4000, rev=False):
    x = noise(d)
    x = sweep_filter(x, f0, f1, "low") - sweep_filter(x, f0 * 0.3, f1 * 0.3, "low") * 0.6
    t = tt(d)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    x = x * e
    return x[::-1] if rev else x


def sfx_click(f=2600, d=0.05):
    t = tt(d)
    tick = np.sin(2 * np.pi * f * t) * np.exp(-t * 180)
    body = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60) * 0.5
    return (tick + body + hp(noise(d), 3000) * np.exp(-t * 300) * 0.3) * 0.8


def sfx_blip():
    out = np.zeros(int(0.32 * SR))
    for i, f in enumerate([392, 294]):
        s = np.sin(2 * np.pi * f * tt(0.12)) * env_ad(0.12, 0.004, 4)
        i0 = int(i * 0.14 * SR)
        out[i0:i0 + len(s)] += s
    return lp(out, 2500) * 0.55


def sfx_slide(d=0.6):
    t = tt(d)
    f = 520 * (0.25 ** (t / d))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.4
    return s + sfx_whoosh(d, 2500, 300) * 0.5


def sfx_riser(d):
    t = tt(d)
    x = sweep_filter(noise(d), 200, 9000, "low")
    x = hp(x, 150)
    tone_f = 110 * (8 ** (t / d) )
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * 0.25 + np.sin(2 * np.pi * np.cumsum(tone_f * 1.5) / SR) * 0.12
    e = (t / d) ** 2.2
    return (x * 0.55 + tone) * e


def sfx_shimmer():
    out = np.zeros(int(1.6 * SR))
    for i, n in enumerate([62, 65, 69, 74, 77, 81]):  # D F A D F A (rising)
        s = bell(midi(n + 12), 1.2) * 0.22
        i0 = int(i * 0.07 * SR)
        out[i0:i0 + len(s)] += s
    return out


def sfx_chime():
    out = np.zeros(int(1.4 * SR))
    for i, n in enumerate([81, 88]):
        s = bell(midi(n), 1.2) * 0.3
        i0 = int(i * 0.09 * SR)
        out[i0:i0 + len(s)] += s
    return out


def sfx_pulse():
    d = 0.18
    return np.sin(2 * np.pi * 1180 * tt(d)) * env_ad(d, 0.002, 7) * 0.22


def sfx_scan():
    return layer(sfx_whoosh(0.4, 1500, 7000) * 0.35, sfx_click(3400) * 0.2)


def sfx_check():
    d = 0.12
    t = tt(d)
    return layer(sfx_click(3000, 0.05) * 0.6, np.sin(2 * np.pi * 1568 * t) * env_ad(d, 0.002, 6) * 0.18)


# ----------------------------------------------------------------- build
def build_sfx(cues):
    bus = np.zeros((N, 2))
    for c in cues:
        t, k = c["t"], c["type"]
        if k == "impact":
            place(bus, sfx_impact(), t, 0.9)
        elif k == "impactSoft":
            place(bus, sfx_impact(soft=True), t, 0.8)
        elif k == "whoosh":
            place(bus, sfx_whoosh(0.45), t - 0.2, 0.32)
        elif k == "cut":
            place(bus, sfx_whoosh(0.2, 800, 6000), t - 0.1, 0.22)
            place(bus, sfx_click(1800), t, 0.4)
        elif k == "click":
            place(bus, sfx_click(), t, 0.45, pan=RNG.uniform(-0.3, 0.3))
        elif k == "tick":
            place(bus, sfx_click(4200, 0.03), t, 0.25)
        elif k == "blip":
            place(bus, sfx_blip(), t, 0.7, pan=0.2)
        elif k == "slide":
            place(bus, sfx_slide(), t, 0.6)
        elif k == "typing":
            n, d = c["count"], c["dur"]
            for i in range(n):
                jt = (i + RNG.uniform(-0.3, 0.3)) / n * d
                place(bus, sfx_click(RNG.uniform(2200, 3600), 0.03), t + jt, RNG.uniform(0.18, 0.3), pan=RNG.uniform(-0.25, 0.25))
        elif k == "stack":
            n, d = c["count"], c["dur"]
            for i in range(n):  # matches the arrival curve in S3cTeam
                ti = t + d * (i / (n - 1)) ** 0.8
                place(bus, sfx_click(1500 + 120 * i, 0.06), ti, 0.32 + 0.02 * i, pan=RNG.uniform(-0.3, 0.3))
        elif k == "riser":
            d = c["dur"]
            place(bus, sfx_riser(d), t - d, 0.5)
        elif k == "shimmer":
            place(bus, sfx_shimmer(), t, 0.8)
        elif k == "chime":
            place(bus, sfx_chime(), t, 0.7)
        elif k == "pulse":
            place(bus, sfx_pulse(), t, 0.7)
        elif k == "scan":
            place(bus, sfx_scan(), t, 0.7)
        elif k == "check":
            place(bus, sfx_check(), t, 0.6)
        elif k == "resolve":
            place(bus, sfx_impact(soft=True), t, 0.9)
        else:
            sys.exit(f"Unknown cue type {k}")
    return add_reverb(bus, wet=0.18, d=1.4)


CHORDS = {  # MIDI notes, D minor -> F major resolution
    "Dm": [50, 57, 62, 65, 69],
    "Bb": [46, 53, 58, 62, 65],
    "F": [41, 53, 57, 60, 65, 69],
    "C": [48, 55, 60, 64, 67],
    "Gm": [43, 55, 58, 62, 67],
    "Fadd9": [41, 53, 57, 60, 67, 69, 72],
}


def build_music(sc):
    bus = np.zeros((N, 2))
    drop = sc["system"]
    unified = sc["unified"]
    cta = sc["cta"]
    endcard = sc["endcard"]
    beat = 0.5
    # beat grid anchored to the drop
    grid = lambda a, b, step: [drop + k * step for k in range(int(np.ceil((a - drop) / step)), int(np.floor((b - drop) / step)) + 1)]

    def chord(name, a, b, bright, gain, attack=0.4, release=0.7):
        for n in CHORDS[name]:
            place(bus, pad_voice(midi(n), b - a + release, bright, attack, release), a, gain)

    # A: opening drone
    chord("Dm", 0.0, sc["fragmented"], 2.5, 0.16, attack=0.05, release=0.6)
    place(bus, sub(midi(38), 2.5), 0.0, 0.5)
    # B: problem section, tense and muted
    prog_b = ["Dm", "Bb", "Dm", "C", "Bb"]
    a = sc["fragmented"]
    seg = (drop - 0.15 - a) / len(prog_b)
    for i, c in enumerate(prog_b):
        chord(c, a + i * seg, a + (i + 1) * seg, 3.2, 0.17, attack=0.25, release=0.35)
    for i, t in enumerate(grid(sc["fragmented"], drop - 0.3, beat / 2)):
        root = CHORDS[prog_b[min(len(prog_b) - 1, int((t - a) / seg))]][0]
        place(bus, lp(pluck(midi(root + 12), 0.25), 1800), t, 0.36 if i % 2 == 0 else 0.2)
    for t in grid(sc["leads"], drop - 0.5, beat):
        place(bus, hat(), t + beat / 2, 0.3, pan=0.3)
    # C: system section, full and confident
    prog_c = ["Bb", "F", "C", "Dm"]
    bar = 2.0
    for i, c in enumerate(prog_c * 2):
        s = drop + i * bar
        if s >= unified:
            break
        e = min(s + bar, unified)
        chord(c, s, e, 6.0, 0.065, attack=0.05, release=0.4)
        place(bus, sub(midi(CHORDS[c][0] - 12 if CHORDS[c][0] > 45 else CHORDS[c][0]), e - s), s, 0.45)
        notes = sorted(CHORDS[c])[1:]
        for j, t in enumerate(grid(s, e - 0.01, beat / 4)):
            place(bus, pluck(midi(notes[(j * 2) % len(notes)] + 12), 0.22, 5), t, 0.05, pan=0.4 if j % 2 else -0.4)
    for t in grid(drop, unified - 0.01, beat):
        place(bus, kick(gain=0.55), t)
        place(bus, hat(), t + beat / 2, 0.22, pan=-0.2)
    # D: unified dashboard, open and major
    for i, c in enumerate(["F", "C"]):
        s = unified + i * (cta - unified) / 2
        e = unified + (i + 1) * (cta - unified) / 2
        chord(c, s, e, 7.0, 0.06, attack=0.08, release=0.5)
        place(bus, sub(midi(CHORDS[c][0] - 12 if CHORDS[c][0] > 45 else CHORDS[c][0]), e - s), s, 0.4)
    for t in grid(unified, cta - 0.01, beat * 2):
        place(bus, kick(gain=0.45), t)
    # E: CTA setup, space for the line
    chord("Bb", cta, endcard, 3.5, 0.11, attack=0.3, release=0.4)
    # Final resolution: F add9, rings out to the end
    chord("Fadd9", endcard, DUR, 5.0, 0.12, attack=0.02, release=2.2)
    for i, n in enumerate([72, 76, 79, 84]):
        place(bus, bell(midi(n), 2.5) * 0.2, endcard + i * 0.06)
    place(bus, sub(midi(29), 3.0), endcard, 0.55)

    bus = add_reverb(bus, wet=0.22, d=2.0, decay=2.4)
    # gentle high cut for warmth, clean low end
    for c in range(2):
        bus[:, c] = hp(lp(bus[:, c], 9000), 32)
    # drop-out before the system hit (lets the riser breathe)
    gap = np.ones(N)
    g0, g1 = int((drop - 0.12) * SR), int(drop * SR)
    gap[g0:g1] = 0.15
    bus *= gap[:, None]
    # final fade
    nf = int(0.5 * SR)
    bus[-nf:] *= np.linspace(1, 0, nf)[:, None] ** 2
    return bus


def duck(music, vo, depth_db=-8.0):
    lev = np.abs(vo.mean(axis=1)) if vo.ndim == 2 else np.abs(vo)
    # envelope follower: 30 ms attack, 300 ms release
    win = int(0.02 * SR)
    blocks = np.array([lev[i:i + win].max() for i in range(0, len(lev), win)])
    env = np.zeros_like(blocks)
    for i, b in enumerate(blocks):
        prev = env[i - 1] if i else 0.0
        k = 0.5 if b > prev else 0.06
        env[i] = prev + k * (b - prev)
    env = np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
    gain_db = depth_db * env
    g = np.repeat(10 ** (gain_db / 20), win)[: len(music)]
    return music * g[:, None]


def limiter(x, ceiling_db=-1.0, lookahead=0.005, release=0.12):
    """Look-ahead peak limiter (stereo-linked)."""
    from scipy.ndimage import minimum_filter1d
    ceiling = 10 ** (ceiling_db / 20)
    peak = np.abs(x).max(axis=1)
    g = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    la = int(lookahead * SR)
    g = minimum_filter1d(g, size=2 * la + 1)
    # smooth: instant attack (already looked ahead), exponential release
    a = np.exp(-1.0 / (release * SR))
    out = np.empty_like(g)
    s = 1.0
    for i in range(len(g)):
        s = g[i] if g[i] < s else a * s + (1 - a) * g[i]
        out[i] = s
    return x * out[:, None], 20 * np.log10(out.min())


def lufs(x):
    import pyloudnorm as pyln
    return pyln.Meter(SR).integrated_loudness(x)


def main():
    if "--skip-vo" not in sys.argv:
        subprocess.run([sys.executable, os.path.join(ROOT, "audio", "build_voiceover.py")], check=True)
    scenes, cues = load_timeline()
    vo, sr = sf.read(os.path.join(AUD, "vo.wav"))
    assert sr == SR
    vo = np.stack([vo, vo], axis=1) if vo.ndim == 1 else vo
    vo = vo[:N] if len(vo) >= N else np.pad(vo, ((0, N - len(vo)), (0, 0)))

    music = duck(build_music(scenes), vo)
    sfx = build_sfx(cues)

    # Balance: narration on top, music ~16 LU under, sfx as accents.
    vo_l = lufs(vo)
    music *= 10 ** (((vo_l - 13.0) - lufs(music)) / 20)
    sfx *= 10 ** (((vo_l - 9.0) - lufs(sfx)) / 20)
    mix = vo + music + sfx
    # Two passes: gain toward the target, then limit; repeat once to land on target.
    for _ in range(2):
        mix = mix * 10 ** ((TARGET_LUFS - lufs(mix)) / 20)
        mix, gr = limiter(mix, -1.2)
    for name, stem in [("vo", vo), ("music", music), ("sfx", sfx)]:
        # unmastered stems for re-mixing; the composition plays the mastered mix
        sf.write(os.path.join(AUD, f"stem_{name}.wav"), (stem * 0.5).astype(np.float32), SR, subtype="PCM_24")
    sf.write(os.path.join(AUD, "mix.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
    print(f"limiter max gain reduction {gr:.1f} dB")
    print(f"mix: {lufs(mix):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS")
    print(f"music under VO by {lufs(vo) - lufs(music):.1f} LU, sfx {lufs(vo) - lufs(sfx):.1f} LU")


if __name__ == "__main__":
    main()
