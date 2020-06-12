import tap from "./tap";
import never from "./never";
import { CANCEL } from "../constants";
import { CancelInterceptor } from "../utils";

class Chain {
  constructor(source, projects) {
    this.source = source;
    this.projects = projects;
  }

  static join(source, projects) {
    return source instanceof Chain
      ? new Chain(source.source, [...source.projects, ...projects])
      : new Chain(source, projects);
  }

  listen(open, next, fail, done, talkback) {
    const cancels = [];
    let cancelled = false;
    let active = 0;

    const run = index => value => {
      const project = this.projects[index];
      const source = project(value);
      const cancel = new CancelInterceptor(never());
      cancels.push(cancel);

      source.listen(
        () => active++,
        index >= this.projects.length - 1 ? next : run(index + 1),
        fail,
        () => --active <= 0 && done(cancelled),
        cancel
      );
    };

    this.source.listen(
      open,
      this.projects.length === 0 ? next : run(0),
      fail,
      () => active <= 0 && done(cancelled),
      tap(payload => {
        if (payload[0] === CANCEL) {
          cancelled = true;
          for (let index = 0; index < cancels.length; index++) {
            const cancel = cancels[index];
            cancel.run();
          }
        }
      })(talkback)
    );
  }
}

const chain = (...projects) => source => Chain.join(source, projects);

export default chain;
