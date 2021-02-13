const env = process.env.NODE_ENV || 'production';
export class debugLogger {

    constructor() {
        this.setColors();
    }

    setColors() {
        const debug = console.debug;

        console.debug = function () {
            let args: [any, ...any[]] = [`\x1b[36m[${getTime()}][DEBUG] %s\x1b[0m`, ...Array.from(arguments)];
            if (env != 'producttion') {
                debug.apply(console, args);
            }
        };

        const error = console.error;

        console.error = function () {
            let args: [any, ...any[]] = [`\x1b[31m[${getTime()}][ERROR] %s\x1b[0m`, ...Array.from(arguments)];
            error.apply(console, args);
        };

        // const log = console.log;

        // console.log = function () {
        //     let args: [any, ...any[]] = ['[LOG]', ...Array.from(arguments)];
        //     log.apply(console, args);
        // };

        const info = console.info;

        console.info = function () {
            let args: [any, ...any[]] = [`\x1b[90m[${getTime()}][INFO] %s\x1b[0m`, ...Array.from(arguments)];
            info.apply(console, args);
        };
    }
}

function getTime() {
    var dt = new Date();
    return `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')}/${dt.getFullYear().toString().padStart(4, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;
}