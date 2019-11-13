import map from "./map";

const tap = fn =>
  map(d => {
    fn(d);
    return d;
  });

export default tap;
