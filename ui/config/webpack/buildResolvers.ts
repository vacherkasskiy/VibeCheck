import path from 'path';
import type { BuildPaths } from './types/config';
import type { WebpackConfiguration } from 'webpack-cli';

export const BuildResolvers = (paths: BuildPaths): WebpackConfiguration['resolve'] => {
	const { src } = paths;

	return {
		extensions: ['.tsx', '.ts', '.js'],
		preferAbsolute: true,
		modules: [src, 'node_modules'],
		mainFiles: ['index'],
		roots: [path.resolve(__dirname, '../../')],
		alias: {
			'@widgets': path.resolve(__dirname, '../../src/widgets'),
			'@shared': path.resolve(__dirname, '../../src/shared'),
			'@pages': path.resolve(__dirname, '../../src/pages'),
			'@features': path.resolve(__dirname, '../../src/features'),
			'@entities': path.resolve(__dirname, '../../src/entities'),
		},
	};
};
