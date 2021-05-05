import { Operator } from "../Stream";

class Map extends Operator {
  constructor(source, project) {
    super(source);
    this.project = project;
  }

  static join(stream, project) {
    return stream instanceof Map
      ? new Map(stream.source, value => project(stream.project(value)))
      : super.join(stream, project);
  }

  listen(open, next, fail, done, talkback) {
    this.source(open, value => next(this.project(value)), fail, done, talkback);
  }
}

const map = project => stream => Map.join(stream, project);

export default map;
