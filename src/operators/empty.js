import Stream from "../Stream";
import Source from "../producers/Source";

const empty = () => {
  const producer = new Source(sink => {
    sink.complete();
  });

  return new Stream(producer);
};

export default empty;
