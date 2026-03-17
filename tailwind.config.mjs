/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				display: ['"Space Grotesk"', 'sans-serif'],
				body: ['Onest', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'fluid-hero': ['clamp(3rem, 10vw + 0.5rem, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
				'fluid-section': ['clamp(1.625rem, 3vw + 0.5rem, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
			},
		},
	},
	plugins: [],
}
