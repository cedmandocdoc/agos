import multicast from "./multicast";

class Collect {
  constructor(source, pipes) {
    this.source = source;
    this.pipes = pipes;
  }

  listen(open, next, fail, done, talkback) {
    let active = false;
    const source = multicast(this.source);
    for (let index = 0; index < this.pipes.length; index++) {
      const pipe = this.pipes[index](source);
      pipe.listen(
        () => {
          if (active) return;
          active = true;
          open();
        },
        value => next([value, index]),
        error => fail([error, index]),
        cancelled => {
          if (!active) return;
          active = false;
          done(cancelled);
        },
        talkback
      );
    }
  }
}

const collect = pipes => source => new Collect(source, pipes);

export default collect;
