import Stream from "../Stream";
import Merge from "../producers/Merge";

const merge = streams => new Stream(new Merge(streams));

export default merge;
