import * as fs from 'fs';
let scriptPath = "./scripts/";

export class ConfigManager {

    script: any;
    config: {};
    defaultConfig: any; //its shitty

    constructor(script, defaultConfig) {
        this.script = script;
        this.config = {};
        this.defaultConfig = defaultConfig
        setInterval(function () {
            this.write(this.config)
        }.bind(this), 1000)
        if (this.pathAndFileExists()) {
            this.load()
        } else {
            this.write(this.defaultConfig)
            this.config = this.defaultConfig
        }
    }

    pathAndFileExists() {
        return this.dirExists() && this.configExist();
    }

    configExist() {
        return fs.existsSync(scriptPath + this.script + "/config.json");
    }

    mkDir() {
        fs.mkdirSync(scriptPath + this.script)
    }

    dirExists() {
        return fs.existsSync(scriptPath + this.script);
    }

    write(config = {}) {
        if (!this.dirExists()) this.mkDir()
        fs.writeFileSync(scriptPath + this.script + "/config.json", JSON.stringify(config, null, 2));
    }

    load() {
        this.config = JSON.parse(fs.readFileSync(scriptPath + this.script + "/config.json").toString())
    }
}
