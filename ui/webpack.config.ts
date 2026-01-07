import * as process from 'node:process';
import path from 'path';
import { BuildWebpackConfig } from './config/webpack/buildWebpackConfig';
import type { BuildMode, BuildPaths } from './config/webpack/types/config';
import type webpack from 'webpack';
import 'dotenv-defaults/config';

export default () => {
	const paths: BuildPaths = {
		entry: path.resolve(__dirname, 'src', 'index.tsx'),
		build: path.resolve(__dirname, 'build'),
		html: path.resolve(__dirname, 'public', 'index.html'),
		src: path.resolve(__dirname, 'src'),
		nodeModules: path.resolve(__dirname, 'node_modules'),
	};

	// env
	const MODE: BuildMode = (process.env.MODE as BuildMode) || 'development';
	const PORT = Number(process.env.PORT) || 3000;
	const IS_DEV = MODE === 'development';
	const API_URL = process.env.API_URL || 'http://localhost:8000/api';

	const env = {
		MODE,
		PORT,
	};

	const config: webpack.Configuration = BuildWebpackConfig({
		env,
		paths,
		API_URL,
		isDev: IS_DEV,
	});

	return config;
};
