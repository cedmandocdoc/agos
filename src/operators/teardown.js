import { noop } from "../utils";
import { CANCEL } from "../constants";

class Teardown {
  constructor(source) {
    this.source = source;
    this.run = noop;
  }

  listen(open, next, fail, done, talkback) {
    this.run = () => next(CANCEL);
    this.source.listen(open, next, fail, done, talkback);
  }
}

const teardown = source => new Teardown(source);

export default teardown;
