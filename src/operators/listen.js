import { noop } from "../utils";

const listen = sink => source => {
  const open = cb => () => {
    cb(sink.open || noop);
  };

  const next = cb => data => {
    cb(typeof sink === "function" ? sink : sink.next || noop, data);
  };

  const error = cb => error => {
    cb(sink.error || noop, error);
  };

  const close = cb => () => {
    cb(sink.close || noop);
  };

  return source.run({ open, next, error, close });
};

export default listen;
