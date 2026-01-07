import type { BuildEnv } from './types/config';
import type { WebpackConfiguration } from 'webpack-cli';

export const BuildDevServer = ({ PORT }: BuildEnv): WebpackConfiguration['devServer'] => {
	return {
		port: PORT,
		historyApiFallback: true, // чтобы не падало при перезагрузке на маршруте
		hot: true,
	};
};
