class Source {
  constructor(provider) {
    this.provider = provider;
  }

  run(control) {
    let active = false;

    const open = cb =>
      control.open(done => {
        try {
          if (active) return;
          active = true;
          cb(done);
        } catch (err) {
          error(err);
        }
      });

    const next = data => {
      if (!active) return;
      try {
        control.next(data);
      } catch (err) {
        error(err);
      }
    };

    const error = control.error;

    const close = cb =>
      control.close(done => {
        try {
          if (!active) return;
          active = false;
          cb(done);
        } catch (err) {
          error(err);
        }
      });

    return this.provider({ open, next, error, close });
  }
}

const create = provider => new Source(provider);

export default create;
