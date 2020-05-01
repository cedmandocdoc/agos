import create from "./create";
import never from "./never";
import teardown from "./teardown";
import { noop } from "../utils";
import { CANCEL } from "../constants";

const concat = sources =>
  create((open, next, fail, done, talkback) => {
    const abort = teardown(never());

    talkback.listen(
      noop,
      value => {
        if (value === CANCEL) {
          abort.run();
          done(true);
        }
      },
      noop,
      noop,
      never()
    );

    const run = index => {
      const source = sources[index];
      source.listen(
        index === 0 ? open : noop,
        next,
        fail,
        () => {
          if (index >= sources.length - 1) return done(false);
          run(index + 1);
        },
        abort
      );
    };

    run(0);
  });

export default concat;
