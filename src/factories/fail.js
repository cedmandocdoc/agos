import create from "./create";

const fail = error =>
  create(control => {
    const open = control.open(done => {
      done();
      throw error;
    });
    const close = control.close(done => done());
    return { open, close };
  });

export default fail;
