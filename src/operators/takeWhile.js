import Stream from "../Stream";
import Period from "../producers/Period";

const takeWhile = fn => stream => new Stream(Period.join(stream.producer, fn));

export default takeWhile;
