import Stream from "../Stream";
import Chain from "../producers/Chain";

const chain = (...fns) => stream =>
  new Stream(Chain.join(stream.producer, fns));

export default chain;
