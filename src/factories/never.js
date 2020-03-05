import create from "./create";

const never = () =>
  create(control => {
    const open = control.open(done => done());
    const close = control.close(done => done());
    return { open, close };
  });

export default never;
