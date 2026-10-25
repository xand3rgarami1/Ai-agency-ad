/**
 * Brand configuration. Everything a client-specific version needs to change lives here.
 *
 * - agencyName: shown on the end card. Replace the placeholder with the real name.
 * - logoSrc:    path inside /public (e.g. 'brand/logo.svg') or null to show a placeholder slot.
 *               Use a light/white version: the end card is black.
 * - showNameWithLogo: also print agencyName with the logo (stacked under it when a logo is set).
 * - ctaLabel:   button copy on the end card.
 * - url:        website / booking URL. null hides the line entirely (no invented URL).
 */
export const BRAND = {
	agencyName: 'Twiddle Agency',
	logoSrc: 'brand/twiddle-logo-white.png' as string | null,
	ctaLabel: 'Book a Systems Consultation',
	url: null as string | null,
	/** Show the dashed "LOGO" slot when no logo is supplied. Set false for a name-only end card. */
	showLogoPlaceholder: true,
	showNameWithLogo: true,
};

export const COLORS = {
	black: '#000000',
	surface: '#0B0B0F',
	surface2: '#121219',
	surface3: '#1A1A23',
	border: 'rgba(255,255,255,0.10)',
	borderStrong: 'rgba(255,255,255,0.18)',
	white: '#FFFFFF',
	text2: 'rgba(255,255,255,0.64)',
	text3: 'rgba(255,255,255,0.40)',
	text4: 'rgba(255,255,255,0.22)',
	purple: '#8B5CF6',
	purpleBright: '#B49CFF',
	purpleDeep: '#4C2A9E',
	purpleGlow: 'rgba(139,92,246,0.55)',
	purpleTint: 'rgba(139,92,246,0.14)',
};

export const FONTS = {
	display: '"Inter Display", "Inter", system-ui, sans-serif',
	body: '"Inter", system-ui, sans-serif',
	mono: '"JetBrains Mono", ui-monospace, monospace',
};

/** Type scale (px at 1080x1920). Nothing that carries meaning goes below 26px. */
export const TYPE = {
	hero: 196,
	h1: 132,
	h2: 96,
	h3: 64,
	lead: 54,
	ui: 30,
	uiSmall: 26,
};
