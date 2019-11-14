import Stream from "../Stream";
import Flatten from "../producers/Flatten";

const join = stream => new Stream(Flatten.join(stream.producer));

export default join;
