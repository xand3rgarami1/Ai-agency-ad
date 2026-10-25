import React from 'react';

export type IconName = 'contact' | 'order' | 'invoice' | 'doc' | 'mail' | 'grid' | 'tasks' | 'pipeline' | 'check' | 'chart' | 'box' | 'warning' | 'phone' | 'missed' | 'message' | 'calendar' | 'clock';

/** Minimal line icons drawn as SVG so they stay crisp at any scale. */
export const Icon: React.FC<{name: IconName; size?: number; color?: string; stroke?: number}> = ({name, size = 28, color = 'currentColor', stroke = 2}) => {
	const p = {fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	const body: Record<IconName, React.ReactNode> = {
		contact: (
			<>
				<circle cx="12" cy="8.5" r="3.6" {...p} />
				<path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" {...p} />
			</>
		),
		order: (
			<>
				<path d="M4 5h2l2.2 10.2h9.6L20 8H7.2" {...p} />
				<circle cx="9.5" cy="19" r="1.3" {...p} />
				<circle cx="16.5" cy="19" r="1.3" {...p} />
			</>
		),
		invoice: (
			<>
				<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z" {...p} />
				<path d="M9 8h6M9 12h6M9 16h3" {...p} />
			</>
		),
		doc: (
			<>
				<path d="M7 3h7l4 4v14H7z" {...p} />
				<path d="M14 3v4h4M10 12h5M10 16h5" {...p} />
			</>
		),
		mail: (
			<>
				<rect x="3.5" y="5.5" width="17" height="13" rx="2" {...p} />
				<path d="M4 7l8 6 8-6" {...p} />
			</>
		),
		grid: (
			<>
				<rect x="3.5" y="4.5" width="17" height="15" rx="2" {...p} />
				<path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15" {...p} />
			</>
		),
		tasks: (
			<>
				<path d="M9 6h11M9 12h11M9 18h11" {...p} />
				<path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" {...p} />
			</>
		),
		pipeline: (
			<>
				<rect x="3.5" y="4.5" width="4.5" height="15" rx="1.2" {...p} />
				<rect x="9.75" y="4.5" width="4.5" height="10" rx="1.2" {...p} />
				<rect x="16" y="4.5" width="4.5" height="6" rx="1.2" {...p} />
			</>
		),
		check: <path d="M5 12.5l4.2 4.2L19 7" {...p} />,
		chart: <path d="M4 18l5-6 4 3 7-9" {...p} />,
		box: (
			<>
				<path d="M4 7.5L12 3.5l8 4v9l-8 4-8-4z" {...p} />
				<path d="M4 7.5l8 4 8-4M12 11.5v9" {...p} />
			</>
		),
		phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" {...p} />,
		missed: (
			<>
				<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" {...p} />
				<path d="M15 3l5 5M20 3l-5 5" {...p} />
			</>
		),
		message: <path d="M4 5.5h16v10H10l-4 3.5v-3.5H4z" {...p} />,
		calendar: (
			<>
				<rect x="3.5" y="5" width="17" height="15" rx="2" {...p} />
				<path d="M3.5 10h17M8 3v4M16 3v4" {...p} />
			</>
		),
		clock: (
			<>
				<circle cx="12" cy="12" r="8.5" {...p} />
				<path d="M12 7.5V12l3 2" {...p} />
			</>
		),
		warning: (
			<>
				<path d="M12 4l9 16H3z" {...p} />
				<path d="M12 10v4.5M12 17.5v.1" {...p} />
			</>
		),
	};
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink: 0, display: 'block'}}>
			{body[name]}
		</svg>
	);
};
