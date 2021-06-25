import Stream from "../Stream";
import create from "./create";
import filter from "./filter";
import listen from "./listen";
import { pipe } from "../utils";

const IDLE = 0;
const ACTIVE = 1;
const DONE = 2;

const emitter = ({ immediate = false } = {}) => {
  let state = IDLE;
  let last = null;
  let set = false;
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
    if (!set) set = true;
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
      if (immediate && set) next(last);
    }

    nexts.add(next);
    fails.add(fail);
    dones.add(done);

    pipe(
      talkback,
      filter(data => data === Stream.CANCEL),
      listen(() => {
        nexts.delete(next);
        fails.delete(fail);
        dones.delete(done);
        done(true);
      })
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
