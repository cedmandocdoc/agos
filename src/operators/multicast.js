import create from "./create";
import never from "./never";
import { noop } from "../utils";
import { CANCEL } from "../constants";

const multicast = source => {
  let active = false;
  const nexts = new Set();
  const fails = new Set();
  const dones = new Set();

  return create((open, next, fail, done, talkback) => {
    nexts.add(next);
    fails.add(fail);
    dones.add(done);
    talkback.listen(
      noop,
      value => {
        if (value === CANCEL) {
          nexts.delete(next);
          fails.delete(fail);
          dones.delete(done);
          done(true);
        }
      },
      noop,
      noop,
      never()
    );
    open();
    if (!active) {
      active = true;
      source.listen(
        noop,
        value => {
          for (const next of nexts.values()) next(value);
        },
        error => {
          for (const fail of fails.values()) fail(error);
        },
        cancelled => {
          for (const done of dones.values()) done(cancelled);
        },
        never()
      );
    }
  });
};

export default multicast;
