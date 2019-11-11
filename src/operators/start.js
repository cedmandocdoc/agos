import State from "../State";
import Guard from "../producers/Guard";
import Teardown from "../producers/Teardown";

const start = sink => stream => {
  const producer = new Teardown(new Guard(stream.producer));
  return producer.run(sink, new State());
};

export default start;
