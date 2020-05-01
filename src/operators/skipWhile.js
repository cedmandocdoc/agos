import filter from "./filter";

const skipWhile = predicate => filter(value => !predicate(value));

export default skipWhile;
