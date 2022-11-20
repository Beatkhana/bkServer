export class WorldTemplate {
    name: any;
    latestId: number;
    clients: any[]; //lazy to change

    constructor(name) {
        this.name = name;
        this.latestId = 1;
        this.clients = []
    }
}

// module.exports = WorldTemplate
