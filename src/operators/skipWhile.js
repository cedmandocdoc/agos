import filter from "./filter";

const skipWhile = fn => filter(d => !fn(d));

export default skipWhile;
