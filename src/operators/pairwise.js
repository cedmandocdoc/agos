import scan from "./scan";
import skip from "./skip";
import { pipe } from "../utils";

const pairwise = () => stream =>
  pipe(
    stream,
    scan((seed, value) => [seed[1], value], []),
    skip(1)
  );

export default pairwise;
