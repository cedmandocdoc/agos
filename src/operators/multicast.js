import create from "./create";
import never from "./never";
import emitter from "./emitter";

const multicast = observable => {
  let active = false;
  const [controller, subject] = emitter();

  return create((open, next, fail, done, talkback) => {
    subject.listen(open, next, fail, done, talkback);
    if (!active) {
      active = true;
      observable.listen(
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
