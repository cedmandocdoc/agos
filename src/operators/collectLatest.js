import collect from "./collect";
import scan from "./scan";
import filter from "./filter";
import { pipe } from "../utils";

const collectLatest = pipes =>
  pipe(
    collect(pipes),
    scan((values, [value, index]) => {
      values[index] = value;
      return values;
    }, []),
    filter(values => values.length >= pipes.length)
  );

export default collectLatest;
