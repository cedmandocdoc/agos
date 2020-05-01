import map from "./map";

const tap = project =>
  map(value => {
    project(value);
    return value;
  });

export default tap;
