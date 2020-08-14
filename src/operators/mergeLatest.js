import merge from "./merge";
import scan from "./scan";
import filter from "./filter";
import { pipe } from "../utils";

const mergeLatest = observables =>
  pipe(
    merge(observables, true),
    scan((values, [value, index]) => {
      values[index] = value;
      return values;
    }, []),
    filter(values => values.length >= observables.length)
  );

export default mergeLatest;
