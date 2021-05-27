import create from "./create";
import empty from "./empty";
import emitter from "./emitter";

const multicast = (stream, options) => {
  let active = false;
  const [controller, subject] = emitter(options);

  return create((open, next, fail, done, talkback) => {
    if (!active) {
      active = true;
      stream.listen(
        controller.open,
        controller.next,
        controller.fail,
        controller.done,
        empty()
      );
    }

    subject.listen(open, next, fail, done, talkback);
  });
};

export default multicast;
