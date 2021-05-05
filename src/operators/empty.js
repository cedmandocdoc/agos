import create from "./create";
import never from "./never";
import Stream from "../Stream";
import { noop } from "../utils";

const empty = () =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload === Stream.CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    done(false);
  });

export default empty;
