import create from "./create";
import never from "./never";
import Stream from "../Stream";
import { noop } from "../utils";

const fail = error =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload === Stream.CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    fail(error);
    done(false);
  });

export default fail;
