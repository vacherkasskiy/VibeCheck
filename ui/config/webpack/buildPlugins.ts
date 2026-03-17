import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import path from 'path';
import type { BuildOptions } from './types/config';
import type { WebpackConfiguration } from 'webpack-cli';

export const BuildPlugins = (props: BuildOptions): WebpackConfiguration['plugins'] => {
	const { paths, isDev, API_URL } = props;

	return [
		new HtmlWebpackPlugin({
			template: paths.html,
		}),
		//
		new MiniCssExtractPlugin({
			filename: 'css/[name].[contenthash:8].css',
			chunkFilename: 'css/[name].[contenthash:8].css',
		}),
		//
		new webpack.DefinePlugin({
			__IS_DEV__: JSON.stringify(isDev),
			__API_URL__: JSON.stringify(API_URL),
		}),
		//
		new webpack.ProgressPlugin(),
		//
		new webpack.HotModuleReplacementPlugin(),
		//
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(paths.public, 'manifest.json'),
					to: path.resolve(paths.build, 'manifest.json'),
				},
				{
					from: path.resolve(paths.public, 'assets'),
					to: path.resolve(paths.build, 'assets'),
					globOptions: {
						ignore: ['**/icon.svg'],
					},
				},
			],
		}),
	];
};
