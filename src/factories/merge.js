class Merge {
  constructor(sources) {
    this.sources = sources;
  }

  run(control) {
    const callbacks = { open: [], close: [] };

    let opened = false;
    let closed = [];

    const open = control.open(dispatch => {
      for (let index = 0; index < callbacks.open.length; index++) {
        callbacks.open[index](dispatch);
      }
    });

    const close = control.close(dispatch => {
      if (closed.length === callbacks.close.length) {
        opened = false;
        closed = [];
        dispatch();
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
          callbacks.open[index] = dispatch => {
            cb(() => {
              if (!opened) {
                opened = true;
                dispatch();
              }
            });
          };
          return open;
        },
        next: cb =>
          control.next((dispatch, data) =>
            cb(data => dispatch([data, index]), data)
          ),
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
