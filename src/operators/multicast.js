import create from "./create";
import never from "./never";
import emitter from "./emitter";

const multicast = source => {
  let active = false;
  const [controller, subject] = emitter();

  return create((open, next, fail, done, talkback) => {
    subject.listen(open, next, fail, done, talkback);
    if (!active) {
      active = true;
      source.listen(
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
