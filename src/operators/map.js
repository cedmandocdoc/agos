class Map {
  constructor(inner, project) {
    this.inner = inner;
    this.project = project;
  }

  static join(source, project) {
    return source instanceof Map
      ? new Map(source.inner, data => project(source.project(data)))
      : new Map(source, project);
  }

  run(control) {
    return this.inner.run({
      open: control.open,
      next: data => {
        control.next(this.project(data));
      },
      error: control.error,
      close: control.close
    });
  }
}

const map = project => source => Map.join(source, project);

export default map;
