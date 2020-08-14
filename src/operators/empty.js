import create from "./create";
import never from "./never";
import Observable from "../Observable";
import { noop } from "../utils";

const empty = () =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload[0] === Observable.CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    done(false);
  });

export default empty;
