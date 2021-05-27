import create from "./create";
import emitter from "./emitter";
import { ControlInterceptor } from "../Stream";

const multicast = (stream, options) => {
  let subject = null;
  let controller = null;
  const interceptor = emitter({ immediate: false });

  return create((open, next, fail, done, talkback) => {
    if (!subject) {
      [controller, subject] = emitter(options);
      stream.listen(
        controller.open,
        controller.next,
        controller.fail,
        cancelled => {
          controller.done(cancelled);
          subject = null;
          controller = null;
        },
        interceptor[1]
      );
    }
    subject.listen(
      open,
      next,
      fail,
      done,
      ControlInterceptor.join(talkback, interceptor[0])
    );
  });
};

export default multicast;
