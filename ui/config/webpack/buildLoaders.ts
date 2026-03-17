import { buildScssLoader } from './loaders/buildScssLoader';
import type { BuildOptions } from './types/config';

export const BuildLoaders = ({ isDev }: BuildOptions) => {
	const tsLoader = {
		test: /\.tsx?$/,
		use: 'ts-loader',
		exclude: /node_modules/,
	};

	const scssLoader = buildScssLoader(isDev);

	// const babelLoader = {
	// 	test: /\.m?js$/,
	// 	exclude: /node_modules/,
	// 	use: {
	// 		loader: 'babel-loader',
	// 		options: {
	// 			presets: ['@babel/preset-env'],
	// 		},
	// 	},
	// };

	const svgLoader = {
		test: /\.svg$/i,
		issuer: /\.[jt]sx?$/,
		use: ['@svgr/webpack'],
	};

	return [svgLoader, tsLoader, scssLoader];
};
