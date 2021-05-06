import Stream, { Operator, CancelInterceptor } from "../Stream";
import tap from "./tap";
import never from "./never";

class Chain extends Operator {
  constructor(source, projects) {
    super(source);
    this.projects = projects;
  }

  static join(stream, project) {
    return stream instanceof Chain
      ? new Chain(stream.source, [...stream.projects, project])
      : super.join(stream, [project]);
  }

  listen(open, next, fail, done, talkback) {
    const cancels = [];
    let cancelled = false;
    let active = 0;

    const run = index => value => {
      const project = this.projects[index];
      const stream = project(value);
      const cancel = CancelInterceptor.join(never());
      cancels.push(cancel);

      stream.listen(
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
        if (payload === Stream.CANCEL) {
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

const chain = project => stream => Chain.join(stream, project);

export default chain;
