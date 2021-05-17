import merge from "./merge";
import scan from "./scan";
import filter from "./filter";
import { pipe } from "../utils";

const mergeLatest = streams => {
  const isArray = streams instanceof Array;
  return pipe(
    merge(streams, true),
    scan(
      (values, [value, index]) => {
        const copy = isArray ? [...values] : Object.assign(values, {});
        copy[index] = value;
        return copy;
      },
      isArray ? [] : {}
    ),
    filter(values =>
      isArray
        ? values.length >= streams.length
        : Object.keys(values).length >= Object.keys(streams).length
    )
  );
};

export default mergeLatest;
