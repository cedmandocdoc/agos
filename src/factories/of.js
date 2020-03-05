import create from "./create";

const of = data =>
  create(control => {
    const open = control.open(done => {
      done();
      control.next(data);
      close();
    });
    const close = control.close(done => done());
    return { open, close };
  });

export default of;
