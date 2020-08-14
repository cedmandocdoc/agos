import { Operator } from "../Observable";

class Map extends Operator {
  constructor(source, project) {
    super(source);
    this.project = project;
  }

  static join(observable, project) {
    return observable instanceof Map
      ? new Map(observable.source, value => project(observable.project(value)))
      : super.join(observable, project);
  }

  listen(open, next, fail, done, talkback) {
    this.source(open, value => next(this.project(value)), fail, done, talkback);
  }
}

const map = project => observable => Map.join(observable, project);

export default map;
