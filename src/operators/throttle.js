import { Operator } from "../Stream";

class Throttle extends Operator {
  constructor(source, tick) {
    super(source);
    this.tick = tick;
  }

  static join(stream, tick) {
    return stream instanceof Throttle
      ? new Throttle(stream.source, (release, data) =>
        stream.tick(() => tick(release, data), data)
      )
      : super.join(stream, tick);
  }

  listen(open, next, fail, done, talkback) {
    let active = false;
    this.source(
      open,
      value => {
        if (active) return;
        active = true;
        this.tick(() => {
          next(value);
          active = false;
        }, value);
      },
      fail,
      done,
      talkback
    );
  }
}

const throttle = tick => stream => Throttle.join(stream, tick);

export default throttle;
