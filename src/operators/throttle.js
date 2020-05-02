class Throttle {
  constructor(source, tick) {
    this.source = source;
    this.tick = tick;
  }

  static join(source, tick) {
    return source instanceof Throttle
      ? new Throttle(source.source, (release, data) =>
          source.tick(() => tick(release, data), data)
        )
      : new Throttle(source, tick);
  }

  listen(open, next, fail, done, talkback) {
    let active = false;
    this.source.listen(
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

const throttle = tick => source => Throttle.join(source, tick);

export default throttle;
