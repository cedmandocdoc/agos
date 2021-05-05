import create from "./create";
import never from "./never";
import Stream, { CancelInterceptor } from "../Stream";
import { noop } from "../utils";

const concat = streams =>
  create((open, next, fail, done, talkback) => {
    const cancel = CancelInterceptor.join(never());

    talkback.listen(
      noop,
      payload => {
        if (payload === Stream.CANCEL) {
          cancel.run();
          done(true);
        }
      },
      noop,
      noop,
      never()
    );

    const run = index => {
      const stream = streams[index];
      stream.listen(
        index === 0 ? open : noop,
        next,
        fail,
        () => {
          if (index >= streams.length - 1) return done(false);
          run(index + 1);
        },
        cancel
      );
    };

    run(0);
  });

export default concat;
