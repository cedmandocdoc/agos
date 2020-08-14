import create from "./create";
import never from "./never";
import Observable from "../Observable";
import { noop } from "../utils";

const fail = error =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload[0] === Observable.CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    fail(error);
    done(false);
  });

export default fail;
