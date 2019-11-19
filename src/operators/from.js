import Stream from "../Stream";
import Source from "../producers/Source";

export default data => {
  const producer = new Source(sink => {
    for (let index = 0; index < data.length; index++) {
      sink.next(data[index]);
    }
    sink.complete();
  });

  return new Stream(producer);
};
