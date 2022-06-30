import { defineConfig } from 'vite'

export default defineConfig({
	publicDir: 'pub',
	build: {
		outDir: 'lib',
		lib: {
			entry: 'src/main.ts',
			formats: ['es'],
			fileName: () => 'map-layers.js'
		},
	}
})