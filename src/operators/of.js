import create from "./create";
import never from "./never";
import Observable from "../Observable";
import { noop } from "../utils";

const of = value =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload[0] === Observable.CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    next(value);
    done(false);
  });

export default of;
