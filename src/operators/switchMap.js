import Observable, { Operator, CancelInterceptor } from "../Observable";
import tap from "./tap";
import never from "./never";

class SwitchMap extends Operator {
  constructor(source, projects) {
    super(source);
    this.projects = projects;
  }

  static join(observable, projects) {
    return observable instanceof SwitchMap
      ? new SwitchMap(observable.source, [...observable.projects, ...projects])
      : super.join(observable, projects);
  }

  listen(open, next, fail, done, talkback) {
    const cancels = [];
    let cancelled = false;
    let finished = false;
    let active = 0;

    const run = index => value => {
      cancels[index] = cancels[index] || CancelInterceptor.join(never());
      const cancel = cancels[index];
      cancel.run();
      const project = this.projects[index];
      const observable = project(value);

      observable.listen(
        () => active++,
        index >= this.projects.length - 1 ? next : run(index + 1),
        fail,
        () => --active <= 0 && finished && done(cancelled),
        cancel
      );
    };

    this.source(
      open,
      this.projects.length === 0 ? next : run(0),
      fail,
      cancel => {
        finished = true;
        cancelled = cancel;
        if (active <= 0) done(cancelled);
      },
      tap(payload => {
        if (payload[0] === Observable.CANCEL) {
          for (let index = 0; index < cancels.length; index++) {
            const cancel = cancels[index];
            cancel.run();
          }
        }
      })(talkback)
    );
  }
}

const switchMap = project => observable =>
  SwitchMap.join(observable, [project]);

export default switchMap;
