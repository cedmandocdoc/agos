import create from "./create";

const never = () =>
  create(control => {
    const open = control.open(dispatch => dispatch());
    const close = control.close(dispatch => dispatch());
    return { open, close };
  });

export default never;
