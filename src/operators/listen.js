import never from "./never";
import { noop } from "../utils";

const listen = (
  open = noop,
  next = noop,
  fail = noop,
  done = noop,
  talkback = never()
) => observable => observable.listen(open, next, fail, done, talkback);

export default listen;
