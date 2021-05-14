import Stream, { Operator, CancelInterceptor } from "../Stream";
import tap from "./tap";
import empty from "./empty";

class SwitchMap extends Operator {
  constructor(source, projects) {
    super(source);
    this.projects = projects;
  }

  static join(stream, projects) {
    return stream instanceof SwitchMap
      ? new SwitchMap(stream.source, [...stream.projects, ...projects])
      : super.join(stream, projects);
  }

  listen(open, next, fail, done, talkback) {
    const cancels = [];
    let cancelled = false;
    let finished = false;
    let active = 0;

    const run = index => value => {
      cancels[index] = cancels[index] || CancelInterceptor.join(empty());
      const cancel = cancels[index];
      cancel.run();
      const project = this.projects[index];
      const stream = project(value);

      stream.listen(
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
        if (payload === Stream.CANCEL) {
          for (let index = 0; index < cancels.length; index++) {
            const cancel = cancels[index];
            cancel.run();
          }
        }
      })(talkback)
    );
  }
}

const switchMap = project => stream => SwitchMap.join(stream, [project]);

export default switchMap;
