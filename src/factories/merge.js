class Merge {
  constructor(sources) {
    this.sources = sources;
  }

  run(control) {
    const callbacks = { open: [], close: [] };

    let opened = false;
    let closed = [];

    const open = control.open(done => {
      for (let index = 0; index < callbacks.open.length; index++) {
        callbacks.open[index](done);
      }
    });

    const close = control.close(done => {
      if (closed.length === callbacks.close.length) {
        opened = false;
        closed = [];
        done();
      } else {
        for (let index = 0; index < callbacks.close.length; index++) {
          callbacks.close[index]();
        }
      }
    });

    for (let index = 0; index < this.sources.length; index++) {
      const source = this.sources[index];
      source.run({
        open: cb => {
          callbacks.open[index] = done => {
            cb(() => {
              if (!opened) {
                opened = true;
                done();
              }
            });
          };
          return open;
        },
        next: data => {
          control.next(data, index);
        },
        error: control.error,
        close: cb => {
          callbacks.close[index] = () => {
            cb(() => {
              closed[index] = true;
              if (closed.length === callbacks.close.length) close();
            });
          };
          return callbacks.close[index];
        }
      });
    }

    return { open, close };
  }
}

const merge = sources => new Merge(sources);

export default merge;
