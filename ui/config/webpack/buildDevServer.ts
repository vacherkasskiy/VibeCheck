import type { BuildEnv, WebpackConfiguration } from './types/config';

export const BuildDevServer = (env: BuildEnv, PORT: number): WebpackConfiguration['devServer'] => {
	return {
		port: PORT,
		historyApiFallback: true,
		hot: true,
		liveReload: false,
		client: {
			overlay: true,
			progress: true,
		},
	};
};
