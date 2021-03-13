import { load, Root } from 'protobuf-typescript';
import { protoAny } from './anyType';
import type { User } from './User';

let root: Root;

(async () => {
    root = await load(__dirname + '/../../protobuf/Models/coordinator.proto');
})();

export class Coordinator implements User {
    id: string;
    name: string;
    getIcon?: string;
    userId?: string;

    static ParseFrom(buffer: Buffer) {

        const coordinator = root.lookupType("TournamentAssistantShared.Models.Coordinator");

        var errMsg = coordinator.verify(buffer);
        if (errMsg)
            throw Error(errMsg);

        const message = coordinator.decode(buffer);

        return coordinator.toObject(message);
    }

    static async encode(data: Coordinator) {
        const root = await load(__dirname + '/../../protobuf/Models/coordinator.proto');
        const coordinator = root.lookupType("TournamentAssistantShared.Models.Coordinator");
        var errMsg = coordinator.verify(data);
        if (errMsg)
            throw Error(errMsg);
        let msg = coordinator.create(data);
        // console.log(msg);
        let buff = coordinator.encode(msg).finish();
        return buff;
    }

    static async encodeAsAny(data: Coordinator) {
        const root = await load(__dirname + '/../../protobuf/Models/coordinator.proto');
        const coordinator = root.lookupType("TournamentAssistantShared.Models.Coordinator");
        var errMsg = coordinator.verify(data);
        if (errMsg)
            throw Error(errMsg);
        let msg = coordinator.create(data);
        let buff = coordinator.encode(msg).finish();

        return new protoAny({
            type_url: "type.googleapis.com/TournamentAssistantShared.Models.Coordinator",
            value: buff
        });
    }
}