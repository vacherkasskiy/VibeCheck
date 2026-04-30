import { Http } from './http';

/**
 * Dedicated HTTP клиент для ReviewService.Gateway
 * baseURL: __REVIEW_GATEWAY_URL__ || http://gateway.local
 */
declare const __REVIEW_GATEWAY_URL__: string;
const reviewBaseUrl = __REVIEW_GATEWAY_URL__ || 'http://gateway.local';

export const reviewHttp = new Http(reviewBaseUrl);

export * from './http';

export default reviewHttp;

