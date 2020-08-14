import collect from "./collect";
import scan from "./scan";
import filter from "./filter";

const collectLatest = pipes => observable =>
  filter(values => values.length >= pipes.length)(
    scan((values, [value, index]) => {
      const newValues = [...values];
      newValues[index] = value;
      return newValues;
    }, [])(collect(pipes)(observable))
  );

export default collectLatest;
