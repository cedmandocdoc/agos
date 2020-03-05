import { noop } from "../utils";

class Concat {
  constructor(sources) {
    this.sources = sources;
  }

  run(control) {
    const callbacks = { open: noop, close: noop };

    let opened = false;
    let index = 0;

    const open = control.open(done => {
      callbacks.open(() => {
        if (!opened) {
          opened = true;
          done();
        }
      });
    });

    const close = control.close(done => {
      callbacks.close(() => {
        if (index >= this.sources.length - 1) {
          index = 0;
          opened = false;
          run();
          done();
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
          callbacks.open = done => cb(done);
          return open;
        },
        next: control.next,
        error: control.error,
        close: cb => {
          callbacks.close = done => cb(done);
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
