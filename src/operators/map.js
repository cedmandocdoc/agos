class Map {
  constructor(source, project) {
    this.source = source;
    this.project = project;
  }

  static join(source, project) {
    return source instanceof Map
      ? new Map(source.source, value => project(source.project(value)))
      : new Map(source, project);
  }

  listen(open, next, fail, done, talkback) {
    this.source.listen(
      open,
      value => next(this.project(value)),
      fail,
      done,
      talkback
    );
  }
}

const map = project => source => Map.join(source, project);

export default map;
