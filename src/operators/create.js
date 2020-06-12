import filter from "./filter";
import { TalkbackCancelInterceptor } from "../utils";

const IDLE = 0;
const ACTIVE = 1;
const DONE = 2;

class Source {
  constructor(producer) {
    this.producer = producer;
  }

  listen(open, next, fail, done, talkback) {
    const cancel = new TalkbackCancelInterceptor(talkback);
    let state = IDLE;
    this.producer(
      () => {
        if (state === IDLE) {
          state = ACTIVE;
          open();
        }
      },
      value => {
        if (state === ACTIVE) {
          try {
            next(value);
          } catch (error) {
            fail(error);
          }
        }
      },
      error => {
        if (state === ACTIVE) fail(error);
      },
      cancelled => {
        if (state === ACTIVE) {
          cancel.run();
          done(cancelled);
          state = DONE;
        }
      },
      filter(() => state === ACTIVE)(cancel)
    );
  }
}

const create = producer => new Source(producer);

export default create;
