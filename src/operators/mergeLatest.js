import merge from "./merge";
import scan from "./scan";
import filter from "./filter";
import { pipe } from "../utils";

const mergeLatest = streams =>
  pipe(
    merge(streams, true),
    scan((values, [value, index]) => {
      values[index] = value;
      return values;
    }, []),
    filter(values => values.length >= streams.length)
  );

export default mergeLatest;
