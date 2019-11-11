import Stream from "../Stream";
import Source from "../producers/Source";

const of = data => {
  const producer = new Source(sink => {
    sink.next(data);
    sink.complete();
  });

  return new Stream(producer);
};

export default of;
