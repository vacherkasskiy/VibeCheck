/**
 * Typed environment variables for Webpack
 * Use __REVIEW_GATEWAY_URL__ defined via webpack.DefinePlugin
 */
export const env = {
  reviewGateway: (typeof window !== 'undefined' ? (window as any).__REVIEW_GATEWAY_URL__ : process.env.REVIEW_GATEWAY_URL) as string || 'http://gateway.local',
} as const;

