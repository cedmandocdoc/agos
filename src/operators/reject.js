import Stream from "../Stream";
import create from "./create";
import filter from "./filter";
import listen from "./listen";
import { pipe } from "../utils";

const fail = error =>
  create((open, next, fail, done, talkback) => {
    pipe(
      talkback,
      filter(data => data === Stream.CANCEL),
      listen(() => done(true))
    );
    open();
    fail(error);
    done(false);
  });

export default fail;
