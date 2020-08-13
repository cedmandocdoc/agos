import listen from "./listen";
import { noop } from "../utils";

const subscribe = (sink, talkback) => {
  if (typeof sink === "function")
    return listen(noop, sink, noop, noop, talkback);
  return listen(sink.open, sink.next, sink.fail, sink.done, talkback);
};

export default subscribe;
