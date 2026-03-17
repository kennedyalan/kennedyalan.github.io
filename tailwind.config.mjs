/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				display: ['Syne', 'sans-serif'],
				body: ['Onest', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'fluid-hero': ['clamp(2.25rem, 5vw + 1rem, 3.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'fluid-section': ['clamp(1.625rem, 3vw + 0.5rem, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
			},
		},
	},
	plugins: [],
}
