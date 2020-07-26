import tap from "./tap";
import never from "./never";
import { CANCEL } from "../constants";
import { CancelInterceptor } from "../utils";

class SwitchMap {
  constructor(source, projects) {
    this.source = source;
    this.projects = projects;
  }

  static join(source, projects) {
    return source instanceof SwitchMap
      ? new SwitchMap(source.source, [...source.projects, ...projects])
      : new SwitchMap(source, projects);
  }

  listen(open, next, fail, done, talkback) {
    const cancels = [];
    let cancelled = false;
    let finished = false;
    let active = 0;

    const run = index => value => {
      cancels[index] = cancels[index] || new CancelInterceptor(never());
      const cancel = cancels[index];
      cancel.run();
      const project = this.projects[index];
      const source = project(value);

      source.listen(
        () => active++,
        index >= this.projects.length - 1 ? next : run(index + 1),
        fail,
        () => --active <= 0 && finished && done(cancelled),
        cancel
      );
    };

    this.source.listen(
      open,
      this.projects.length === 0 ? next : run(0),
      fail,
      cancel => {
        finished = true;
        cancelled = cancel;
        if (active <= 0) done(cancelled);
      },
      tap(payload => {
        if (payload[0] === CANCEL) {
          for (let index = 0; index < cancels.length; index++) {
            const cancel = cancels[index];
            cancel.run();
          }
        }
      })(talkback)
    );
  }
}

const switchMap = project => source => SwitchMap.join(source, [project]);

export default switchMap;
