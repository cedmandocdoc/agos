import Stream from "../Stream";
import Chain from "../producers/Chain";

const join = stream => new Stream(Chain.join(stream.producer, [() => stream]));

export default join;
