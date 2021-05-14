import create from "./create";
import never from "./never";
import emitter from "./emitter";

const multicast = (stream, options) => {
  let active = false;
  const [controller, subject] = emitter(options);

  return create((open, next, fail, done, talkback) => {
    subject.listen(open, next, fail, done, talkback);
    if (!active) {
      active = true;
      stream.listen(
        controller.open,
        controller.next,
        controller.fail,
        controller.done,
        never()
      );
    }
  });
};

export default multicast;
