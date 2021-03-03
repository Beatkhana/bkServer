import protobuf from "protobuf-typescript";

export class protoAny {

    constructor(properties) {
        protobuf.Message.call(this, properties);
    }

}