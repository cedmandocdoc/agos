import Stream from "../Stream";
import create from "./create";
import filter from "./filter";
import listen from "./listen";
import { pipe } from "../utils";

const of = value =>
  create((open, next, fail, done, talkback) => {
    pipe(
      talkback,
      filter(data => data === Stream.CANCEL),
      listen(() => done(true))
    );
    open();
    next(value);
    done(false);
  });

export default of;
