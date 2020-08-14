import create from "./create";
import never from "./never";
import Observable, { CancelInterceptor } from "../Observable";
import { noop } from "../utils";

const concat = observables =>
  create((open, next, fail, done, talkback) => {
    const cancel = CancelInterceptor.join(never());

    talkback.listen(
      noop,
      payload => {
        if (payload[0] === Observable.CANCEL) {
          cancel.run();
          done(true);
        }
      },
      noop,
      noop,
      never()
    );

    const run = index => {
      const observable = observables[index];
      observable.listen(
        index === 0 ? open : noop,
        next,
        fail,
        () => {
          if (index >= observables.length - 1) return done(false);
          run(index + 1);
        },
        cancel
      );
    };

    run(0);
  });

export default concat;
