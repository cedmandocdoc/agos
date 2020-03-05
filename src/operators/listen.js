import { noop } from "../utils";

const listen = sink => source => {
  const open = cb => () => {
    cb(sink.open || noop);
  };

  const next = typeof sink === "function" ? sink : sink.next || noop;

  const error = sink.error || noop;

  const close = cb => () => {
    cb(sink.close || noop);
  };

  return source.run({ open, next, error, close });
};

export default listen;
