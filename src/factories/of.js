import create from "./create";

const of = data =>
  create(control => {
    const open = control.open(dispatch => {
      dispatch();
      next(data);
      close();
    });

    const next = control.next((dispatch, data) => dispatch(data));
    const close = control.close(dispatch => dispatch());
    return { open, close };
  });

export default of;
