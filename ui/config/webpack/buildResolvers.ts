import path from 'path';
import type { BuildPaths } from './types/config';
import type { WebpackConfiguration } from 'webpack-cli';

export const BuildResolvers = (paths: BuildPaths): WebpackConfiguration['resolve'] => {
	const { src } = paths;

	return {
		extensions: ['.tsx', '.ts', '.js'],
		// настройки для работы абсолютных путей
		preferAbsolute: true,
		modules: [src, 'node_modules'],
		mainFiles: ['index'],
		roots: [path.resolve(__dirname, '../../')],
		alias: {
			'@widgets': 'widgets',
			'@shared': 'shared',
			'@pages': 'pages',
			'@features': 'features',
			'@entities': 'entities',
		},
	};
};
