import create from "./create";

const fail = error =>
  create(control => {
    const open = control.open(dispatch => {
      dispatch();
      throw error;
    });
    const close = control.close(dispatch => dispatch());
    return { open, close };
  });

export default fail;
