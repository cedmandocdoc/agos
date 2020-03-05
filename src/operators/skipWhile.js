import filter from "./filter";

const skipWhile = predicate => filter(data => !predicate(data));

export default skipWhile;
