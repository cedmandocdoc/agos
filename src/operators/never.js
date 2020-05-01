import create from "./create";
import { noop } from "../utils";

const never = () => create(noop);

export default never;
