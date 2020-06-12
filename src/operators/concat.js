import create from "./create";
import never from "./never";
import { noop, CancelInterceptor } from "../utils";
import { CANCEL } from "../constants";

const concat = sources =>
  create((open, next, fail, done, talkback) => {
    const cancel = new CancelInterceptor(never());

    talkback.listen(
      noop,
      payload => {
        if (payload[0] === CANCEL) {
          cancel.run();
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
        cancel
      );
    };

    run(0);
  });

export default concat;
