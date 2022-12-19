import { AxiosResponse } from "axios";

export function rateLimitThrottle<T>(request: AxiosResponse<T>) {
    const remaining = +request.headers["x-ratelimit-remaining"];
    const reset = +request.headers["x-ratelimit-reset"];
    const now = Date.now();
    const resetTime = new Date(reset * 1000);
    const timeToReset = resetTime.getTime() - now;
    if (remaining < 2) {
        // console.log(`Rate limit reached, waiting ${(timeToReset / 1000).toFixed(2)}s`);
        return new Promise(resolve => setTimeout(resolve, timeToReset));
    }
    return Promise.resolve();
}
