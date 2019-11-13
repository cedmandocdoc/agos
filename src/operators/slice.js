import Stream from "../Stream";
import Slice from "../producers/Slice";

const slice = (start, end) => stream =>
  new Stream(Slice.join(stream.producer, start, end));

export default slice;
