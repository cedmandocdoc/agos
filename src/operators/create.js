import tap from "./tap";
import { CANCEL } from "../constants";

class Source {
  constructor(producer) {
    this.producer = producer;
  }

  listen(open, next, fail, done, talkback) {
    let completed = false;
    let cancelled = false;
    let active = false;
    this.producer(
      () => {
        if (active || completed) return;
        active = true;
        open();
      },
      value => {
        if (!active || cancelled || completed) return;
        try {
          next(value);
        } catch (error) {
          fail(error);
        }
      },
      error => {
        if (!active || cancelled || completed) return;
        fail(error);
      },
      cancelled => {
        if (!active || completed) return;
        completed = true;
        try {
          done(cancelled);
        } catch (error) {
          fail(error);
        }
      },
      tap(value => value === CANCEL && (cancelled = true))(talkback)
    );
  }
}

const create = producer => new Source(producer);

export default create;
