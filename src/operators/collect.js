import emitter from "./emitter";
import { noop, CancelInterceptor } from "../utils";
import never from "./never";

class Collect {
  constructor(source, pipes) {
    this.source = source;
    this.pipes = pipes;
  }

  listen(open, next, fail, done, talkback) {
    // TO DO investigate if emitter
    // is appropriate to use in collection
    const [controller, subject] = emitter();
    const cancel = new CancelInterceptor(talkback);
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
    this.source.listen(
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

const collect = pipes => source => new Collect(source, pipes);

export default collect;
