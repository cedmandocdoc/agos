import create from "./create";

export default (array = []) =>
  create(control => {
    const open = control.open(dispatch => {
      dispatch();
      for (let index = 0; index < array.length; index++) next(array[index]);
      close();
    });
    const next = control.next((dispatch, data) => dispatch(data));
    const close = control.close(dispatch => dispatch());
    return { open, close };
  });
