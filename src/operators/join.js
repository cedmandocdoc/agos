import Stream from "../Stream";
import Flatten from "../producers/Flatten";

const join = (level = 1) => stream =>
  new Stream(Flatten.join(stream.producer, level));

export default join;
