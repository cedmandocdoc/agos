import create from "./create";

const empty = () =>
  create(control => {
    const open = control.open(done => {
      done();
      close();
    });
    const close = control.close(done => done());
    return { open, close };
  });

export default empty;
