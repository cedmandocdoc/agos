import { Operator } from "../Observable";

class Throttle extends Operator {
  constructor(source, tick) {
    super(source);
    this.tick = tick;
  }

  static join(observable, tick) {
    return observable instanceof Throttle
      ? new Throttle(observable.source, (release, data) =>
          observable.tick(() => tick(release, data), data)
        )
      : super.join(observable, tick);
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

const throttle = tick => observable => Throttle.join(observable, tick);

export default throttle;
