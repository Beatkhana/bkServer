import { EventEmitter } from "events";

const emitter: EventEmitter = new EventEmitter();
emitter.setMaxListeners(1000);

export { emitter };
