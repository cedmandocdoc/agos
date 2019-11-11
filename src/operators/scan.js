import Stream from "../Stream";
import Accumulate from "../producers/Accumulate";

const scan = (fn, seed) => stream =>
  new Stream(Accumulate.join(stream.producer, fn, seed));

export default scan;
