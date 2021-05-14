import create from "./create";
import empty from "./empty";
import Stream from "../Stream";
import { noop } from "../utils";

const IDLE = 0;
const ACTIVE = 1;
const DONE = 2;

const emitter = ({ immediate = false } = {}) => {
  let state = IDLE;
  let last = null;
  const opens = new Set();
  const nexts = new Set();
  const fails = new Set();
  const dones = new Set();

  const open = () => {
    if (state === IDLE) {
      state = ACTIVE;
      for (const open of opens.values()) open();
      opens.clear();
    }
  };

  const next = value => {
    last = value;
    if (state === ACTIVE) for (const next of nexts.values()) next(value);
  };

  const fail = error => {
    if (state === ACTIVE) for (const fail of fails.values()) fail(error);
  };

  const done = cancelled => {
    if (state === ACTIVE) {
      state = DONE;
      for (const done of dones.values()) done(cancelled);
      nexts.clear();
      fails.clear();
      dones.clear();
    }
  };

  const stream = create((open, next, fail, done, talkback) => {
    if (state === IDLE) opens.add(open);
    else if (state === ACTIVE) {
      open();
      if (immediate) next(last);
    }

    nexts.add(next);
    fails.add(fail);
    dones.add(done);
    talkback.listen(
      noop,
      payload => {
        if (payload === Stream.CANCEL) {
          nexts.delete(next);
          fails.delete(fail);
          dones.delete(done);
          done(true);
        }
      },
      noop,
      noop,
      empty()
    );
  });

  return [
    {
      open,
      next,
      fail,
      done
    },
    stream
  ];
};

export default emitter;
