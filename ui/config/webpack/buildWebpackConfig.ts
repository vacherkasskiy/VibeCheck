import { BuildDevServer } from './buildDevServer';
import { BuildLoaders } from './buildLoaders';
import { BuildPlugins } from './buildPlugins';
import { BuildResolvers } from './buildResolvers';
import type { BuildOptions } from './types/config';
import type { WebpackConfiguration } from 'webpack-cli';

export const BuildWebpackConfig = (options: BuildOptions): WebpackConfiguration => {
	const { env, paths } = options;

	return {
		module: {
			rules: BuildLoaders(options),
		},
		resolve: BuildResolvers(paths),
		entry: paths.entry,
		output: {
			filename: '[name][contenthash].js',
			path: paths.build,
			clean: true,
			publicPath: '/',
		},
		mode: env.MODE,
		plugins: BuildPlugins(options),
		devServer: BuildDevServer(env),
		ignoreWarnings: [
			{
				message: /Deprecation/,
			},
		],
	};
};
