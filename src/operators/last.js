import Stream from "../Stream";
import Slice from "../producers/Slice";

const last = stream => new Stream(Slice.join(stream.producer, -1));

export default last;
