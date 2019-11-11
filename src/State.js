class State {
  constructor() {
    this.active = true;
  }

  enable() {
    this.active = true;
  }

  disable() {
    this.active = false;
  }
}

export default State;
