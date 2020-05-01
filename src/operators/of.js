import create from "./create";
import never from "./never";
import { noop } from "../utils";
import { CANCEL } from "../constants";

const of = value =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      value => value === CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    next(value);
    done(false);
  });

export default of;
