import { noop } from "../utils";

class Concat {
  constructor(sources) {
    this.sources = sources;
  }

  run(control) {
    const callbacks = { open: noop, close: noop };

    let opened = false;
    let index = 0;

    const open = control.open(dispatch => {
      callbacks.open(() => {
        if (!opened) {
          opened = true;
          dispatch();
        }
      });
    });

    const close = control.close(dispatch => {
      callbacks.close(() => {
        if (index >= this.sources.length - 1) {
          index = 0;
          opened = false;
          run();
          dispatch();
        } else {
          index++;
          run();
          open();
        }
      });
    });

    const run = () => {
      const source = this.sources[index];
      source.run({
        open: cb => {
          callbacks.open = dispatch => cb(dispatch);
          return open;
        },
        next: control.next,
        error: control.error,
        close: cb => {
          callbacks.close = dispatch => cb(dispatch);
          return close;
        }
      });
    };

    run();

    return { open, close };
  }
}

const concat = sources => new Concat(sources);

export default concat;
