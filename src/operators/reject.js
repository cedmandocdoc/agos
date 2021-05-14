import create from "./create";
import empty from "./empty";
import Stream from "../Stream";
import { noop } from "../utils";

const fail = error =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload === Stream.CANCEL && done(true),
      noop,
      noop,
      empty()
    );
    open();
    fail(error);
    done(false);
  });

export default fail;
