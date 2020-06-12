import create from "./create";
import never from "./never";
import { noop } from "../utils";
import { CANCEL } from "../constants";

const fail = error =>
  create((open, next, fail, done, talkback) => {
    talkback.listen(
      noop,
      payload => payload[0] === CANCEL && done(true),
      noop,
      noop,
      never()
    );
    open();
    fail(error);
    done(false);
  });

export default fail;
