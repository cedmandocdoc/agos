class Source {
  constructor(provider) {
    this.provider = provider;
  }

  run(control) {
    let active = false;

    const open = cb =>
      control.open(dispatch => {
        try {
          if (active) return;
          active = true;
          cb(dispatch);
        } catch (err) {
          error(err);
        }
      });

    const next = cb =>
      control.next((dispatch, data) => {
        if (!active) return;
        try {
          cb(dispatch, data);
        } catch (err) {
          error(err);
        }
      });

    const error = control.error((dispatch, error) => dispatch(error));

    const close = cb =>
      control.close(dispatch => {
        try {
          if (!active) return;
          active = false;
          cb(dispatch);
        } catch (err) {
          error(err);
        }
      });

    return this.provider({ open, next, error: control.error, close });
  }
}

const create = provider => new Source(provider);

export default create;
