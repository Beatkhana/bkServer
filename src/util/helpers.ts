export const formUrlEncoded = (x: { [x: string]: any }) => Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, "");
