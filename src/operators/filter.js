import Stream from "../Stream";
import Filter from "../producers/Filter";

const filter = fn => stream => new Stream(Filter.join(stream.producer, fn));

export default filter;
