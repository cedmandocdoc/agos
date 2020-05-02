import tap from "./tap";
import never from "./never";
import teardown from "./teardown";
import { CANCEL } from "../constants";

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
    const aborts = [];
    let cancelled = false;
    let active = 0;

    const run = index => value => {
      // console.log(aborts[index]);
      aborts[index] = aborts[index] || teardown(never());
      const abort = aborts[index];
      abort.run();
      const project = this.projects[index];
      const source = project(value);

      source.listen(
        () => active++,
        index >= this.projects.length - 1 ? next : run(index + 1),
        fail,
        () => --active <= 0 && done(cancelled),
        abort
      );
    };

    this.source.listen(
      open,
      this.projects.length === 0 ? next : run(0),
      fail,
      () => {},
      tap(value => {
        if (value === CANCEL) {
          cancelled = true;
          for (let index = 0; index < aborts.length; index++) {
            const abort = aborts[index];
            abort.run();
          }
        }
      })(talkback)
    );
  }
}

const switchMap = project => source => SwitchMap.join(source, [project]);

export default switchMap;
