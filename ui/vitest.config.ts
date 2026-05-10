import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	define: {
		__API_URL__: JSON.stringify('/api'),
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		css: true,
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
	},
	resolve: {
		alias: {
			shared: path.resolve(__dirname, 'src/shared'),
			entities: path.resolve(__dirname, 'src/entities'),
			features: path.resolve(__dirname, 'src/features'),
			widgets: path.resolve(__dirname, 'src/widgets'),
			pages: path.resolve(__dirname, 'src/pages'),
			app: path.resolve(__dirname, 'src/app'),
			'@shared': path.resolve(__dirname, 'src/shared'),
			'@entities': path.resolve(__dirname, 'src/entities'),
			'@features': path.resolve(__dirname, 'src/features'),
			'@widgets': path.resolve(__dirname, 'src/widgets'),
			'@pages': path.resolve(__dirname, 'src/pages'),
		},
	},
});
