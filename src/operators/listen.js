import empty from "./empty";
import { noop } from "../utils";

const listen = (sink, talkback = empty()) => stream => {
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
