import never from "./never";
import { noop } from "../utils";

const listen = (sink, talkback = never()) => stream => {
  if (typeof sink === "function")
    return stream.listen(noop, sink, noop, noop, talkback);
  return stream.listen(
    sink.open || noop,
    sink.next || noop,
    sink.fail || noop,
    sink.done || noop,
    talkback
  );
};

export default listen;
