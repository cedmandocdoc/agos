import map from "./map";

const tap = project =>
  map(data => {
    project(data);
    return data;
  });

export default tap;
