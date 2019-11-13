import Stream from "../Stream";
import MergeLatest from "../producers/MergeLatest";

const mergeLatest = streams => new Stream(new MergeLatest(streams));

export default mergeLatest;
