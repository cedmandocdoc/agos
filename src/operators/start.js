import State from "../State";
import Guard from "../producers/Guard";
import Teardown from "../producers/Teardown";

const start = sink => stream => {
  const destination = {
    next: () => {},
    complete: () => {},
    error: () => {}
  };

  if (typeof sink === "function") destination.next = sink;
  else if (typeof sink === "object") {
    destination.next = sink.next || (() => {});
    destination.complete = sink.complete || (() => {});
    destination.error = sink.error || (() => {});
  }

  const producer = new Teardown(new Guard(stream.producer));
  return producer.run(destination, new State());
};

export default start;
