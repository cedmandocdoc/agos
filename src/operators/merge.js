import fromArray from "./fromArray";
import fromObject from "./fromObject";
import chain from "./chain";
import map from "./map";
import { pipe } from "../utils";

const merge = (streams, withIndex) =>
  pipe(
    streams instanceof Array
      ? fromArray(streams, true)
      : fromObject(streams, true),
    chain(([stream, index]) =>
      withIndex
        ? pipe(
            stream,
            map(value => [value, index])
          )
        : stream
    )
  );

export default merge;
