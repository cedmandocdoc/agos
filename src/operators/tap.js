import Stream from "../Stream";
import Transform from "../producers/Transform";

const tap = fn => stream => {
  const producer = Transform.join(stream.producer, d => {
    fn(d);
    return d;
  });

  return new Stream(producer);
};

export default tap;
