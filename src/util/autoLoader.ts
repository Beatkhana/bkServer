import { promises as fs } from "fs";

export async function loadDir<T>(dir: string, exclude: string[] = []) {
    const modules: T[] = [];
    const files = await fs.readdir(dir);
    for (const file of files) {
        if (exclude.some(x => file.includes(x))) continue;
        const x = await import(`${dir}/${file}`);
        if (x.default) modules.push(new x.default);
    }
    return modules;
}