import type webpack from 'webpack';

export type BuildMode = 'development' | 'production';

export interface BuildPaths {
	entry: string;
	build: string;
	html: string;
	public: string;
	src: string;
	nodeModules: string;
	swEntry?: string;
	port?: number;
}

export interface BuildEnv {
	MODE: BuildMode;
}

export interface BuildOptions {
	paths: BuildPaths;
	env: BuildEnv;
	isDev: boolean;
	API_URL: string;
	REVIEW_GATEWAY_URL?: string;
}


export type WebpackConfiguration = webpack.Configuration;
