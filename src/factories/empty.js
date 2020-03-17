import create from "./create";

const empty = () =>
  create(control => {
    const open = control.open(dispatch => {
      dispatch();
      close();
    });
    const close = control.close(dispatch => dispatch());
    return { open, close };
  });

export default empty;
