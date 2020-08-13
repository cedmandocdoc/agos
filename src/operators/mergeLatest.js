import merge from "./merge";
import scan from "../operators/scan";
import filter from "../operators/filter";
import { pipe } from "../utils";

const mergeLatest = sources =>
  pipe(
    merge(sources, true),
    scan((values, [value, index]) => {
      values[index] = value;
      return values;
    }, []),
    filter(values => values.length >= sources.length)
  );

export default mergeLatest;
