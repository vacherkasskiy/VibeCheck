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
		proxy: [
			{
				context: ['/api'],
				target: 'http://51.250.12.183:8000',
				changeOrigin: true,
				secure: false,
			},
			{
				context: ['/gamification'],
				target: 'http://51.250.12.183:5000',
				changeOrigin: true,
				secure: false,
				pathRewrite: { '^/gamification': '/api' },
			},
		],
	};
};
