import create from "./create";

export default (array = []) =>
  create(control => {
    const open = control.open(done => {
      done();
      for (let index = 0; index < array.length; index++)
        control.next(array[index]);
      close();
    });
    const close = control.close(done => done());
    return { open, close };
  });
