import Observable, { Operator, CancelInterceptor } from "../Observable";
import tap from "./tap";
import never from "./never";

class Chain extends Operator {
  constructor(source, projects) {
    super(source);
    this.projects = projects;
  }

  static join(observable, projects) {
    return observable instanceof Chain
      ? new Chain(observable.source, [...observable.projects, ...projects])
      : super.join(observable, projects);
  }

  listen(open, next, fail, done, talkback) {
    const cancels = [];
    let cancelled = false;
    let active = 0;

    const run = index => value => {
      const project = this.projects[index];
      const observable = project(value);
      const cancel = CancelInterceptor.join(never());
      cancels.push(cancel);

      observable.listen(
        () => active++,
        index >= this.projects.length - 1 ? next : run(index + 1),
        fail,
        () => --active <= 0 && done(cancelled),
        cancel
      );
    };

    this.source(
      open,
      this.projects.length === 0 ? next : run(0),
      fail,
      () => active <= 0 && done(cancelled),
      tap(payload => {
        if (payload[0] === Observable.CANCEL) {
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

const chain = (...projects) => observable => Chain.join(observable, projects);

export default chain;
