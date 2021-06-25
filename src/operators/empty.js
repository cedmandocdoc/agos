import create from "./create";

const empty = () =>
  create((open, next, fail, done) => {
    open();
    done(false);
  });

export default empty;
