import create from "./create";
import emitter from "./emitter";
import { ControlInterceptor } from "../Stream";

const multicast = (stream, { immediate = false } = {}) => {
  let subject = null;
  let controller = null;
  const interceptor = emitter({ immediate: false });

  return create((open, next, fail, done, talkback) => {
    if (!subject) {
      [controller, subject] = emitter({ immediate });
      subject.listen(
        open,
        next,
        fail,
        done,
        ControlInterceptor.join(talkback, interceptor[0])
      );
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
    } else
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
