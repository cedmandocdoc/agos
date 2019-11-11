import Stream from "../Stream";
import Slice from "../producers/Slice";

const skip = amount => stream =>
  new Stream(Slice.join(stream.producer, amount));

export default skip;
