import * as process from 'node:process';
import path from 'path';
import { BuildWebpackConfig } from './config/webpack/buildWebpackConfig';
import type { BuildMode, BuildPaths, BuildEnv } from './config/webpack/types/config';
import type webpack from 'webpack';
import 'dotenv-defaults/config';

export default (): webpack.Configuration => {
	const paths: BuildPaths = {
		entry: path.resolve(__dirname, 'src', 'index.tsx'),
		build: path.resolve(__dirname, 'build'),
		html: path.resolve(__dirname, 'public', 'index.html'),
		public: path.resolve(__dirname, 'public'),
		src: path.resolve(__dirname, 'src'),
		nodeModules: path.resolve(__dirname, 'node_modules'),
		swEntry: path.resolve(__dirname, 'src', 'sw.ts'),
	};

	const MODE: BuildMode = (process.env.MODE as BuildMode) || 'development';
	const API_URL = process.env.API_URL || 'http://localhost:8000/api';
	const IS_DEV = MODE === 'development';

	const env: BuildEnv = {
		MODE,
	};

	const config = BuildWebpackConfig({
		env,
		paths,
		API_URL,
		isDev: IS_DEV,
	});

	if (paths.swEntry && !IS_DEV) {
		(config as any).entry = {
			main: config.entry,
			sw: {
				import: paths.swEntry,
				filename: 'sw.js',
			},
		};

		(config as any).output = {
			...config.output,
			filename: (pathData: any) => {
				if (pathData.chunk?.name === 'sw') {
					return 'sw.js';
				}
				return '[name].[contenthash:8].js';
			},
			assetModuleFilename: '[contenthash:8][ext]',
		};
	}

	return config;
};
