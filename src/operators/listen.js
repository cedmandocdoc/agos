import never from "./never";
import { noop } from "../utils";

const listen = (sink, talkback = never()) => stream => {
  if (typeof sink === "function")
    return stream.listen(noop, sink, noop, noop, talkback);
  return stream.listen(sink.open, sink.next, sink.fail, sink.done, talkback);
};

export default listen;
