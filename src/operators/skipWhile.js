import Stream from "../Stream";
import Filter from "../producers/Filter";

const skipWhile = fn => stream =>
  new Stream(Filter.join(stream.producer, data => !fn(data)));

export default skipWhile;
