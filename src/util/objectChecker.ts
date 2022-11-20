export function checkObjectValues(obj: any) {
    for (const key in obj) {
        if (obj[key] === undefined || obj[key] === null) {
            throw new Error(`Missing value for ${key}`);
        } else if (typeof obj[key] === "object") {
            checkObjectValues(obj[key]);
        }
    }
    return true;
}
