import merge from "./merge";
import scan from "./scan";
import map from "./map";
import filter from "./filter";
import { pipe } from "../utils";

const mergeLatest = streams =>
  pipe(
    merge(streams, true),
    scan((values, [value, index]) => {
      const result = { ...values };
      result[index] = value;
      return result;
    }, {}),
    filter(values => Object.keys(values).length >= Object.keys(streams).length),
    map(values => {
      if (streams instanceof Array) {
        const result = [];
        Object.keys(values).forEach(key => (result[key] = values[key]));
        return result;
      }
      return values;
    })
  );

export default mergeLatest;
