import Stream from "../Stream";
import Source from "../producers/Source";

const fail = error => {
  const producer = new Source(sink => {
    sink.error(error);
  });
  return new Stream(producer);
};

export default fail;
