import { noop } from "../utils";

class FlatMap {
  constructor(inner, projects) {
    this.inner = inner;
    this.projects = projects;
  }

  static join(source, projects) {
    return source instanceof FlatMap
      ? new FlatMap(source.inner, [...source.projects, ...projects])
      : new FlatMap(source, projects);
  }

  run(control) {
    const callbacks = { close: [] };

    let inprogress = [];

    const next = index => data => {
      if (index >= this.projects.length) control.next(data);
      else {
        const source = this.projects[index](data);
        let open = noop;
        source.run({
          open: cb => {
            open = () =>
              cb(() => {
                inprogress++;
              });
            return open;
          },
          next: next(index + 1),
          error: control.error,
          close: cb => {
            callbacks.close.push(() => {
              cb(() => {
                if (--inprogress <= 0) close();
              });
            });
            return callbacks.close[callbacks.close.length - 1];
          }
        });
        open();
      }
    };

    const close = control.close(done => {
      if (inprogress <= 0) {
        inprogress = [];
        done();
      } else {
        for (let index = 0; index < callbacks.close.length; index++) {
          callbacks.close[index]();
        }
      }
    });

    return this.inner.run({
      open: control.open,
      next: next(0),
      error: control.error,
      close: cb => {
        callbacks.close.push(() => {
          cb(() => {
            if (inprogress <= 0) close();
          });
        });
        return callbacks.close[callbacks.close.length - 1];
      }
    });
  }
}

const flatMap = (...projects) => source => FlatMap.join(source, projects);

export default flatMap;
