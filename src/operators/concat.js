import Stream from "../Stream";
import Concat from "../producers/Concat";

const concat = streams => new Stream(new Concat(streams));

export default concat;
