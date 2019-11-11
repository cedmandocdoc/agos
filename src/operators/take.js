import Stream from "../Stream";
import Slice from "../producers/Slice";

const take = amount => stream =>
  new Stream(Slice.join(stream.producer, 0, amount));

export default take;
