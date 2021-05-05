import emitter from "./emitter";
import never from "./never";
import { Operator, CancelInterceptor } from "../Stream";
import { noop } from "../utils";

class Collect extends Operator {
  constructor(source, pipes) {
    super(source);
    this.pipes = pipes;
  }

  listen(open, next, fail, done, talkback) {
    // TO DO investigate if emitter
    // is appropriate to use in collection
    const [controller, subject] = emitter();
    const cancel = CancelInterceptor.join(talkback);
    let cancelled = 0;
    let active = false;
    for (let index = 0; index < this.pipes.length; index++) {
      const pipe = this.pipes[index](subject);
      pipe.listen(
        noop,
        value => next([value, index]),
        error => fail([error, index]),
        () => {
          if (active && ++cancelled >= this.pipes.length) cancel.run();
        },
        never()
      );
    }
    this.source(
      () => {
        active = true;
        open();
        controller.open();
      },
      controller.next,
      controller.fail,
      cancelled => {
        active = false;
        done(cancelled);
        controller.done(cancelled);
      },
      cancel
    );
  }
}

const collect = pipes => stream => Collect.join(stream, pipes);

export default collect;
