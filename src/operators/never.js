import Stream from "../Stream";
import Source from "../producers/Source";

const never = () => new Stream(new Source(() => ({ stop: () => {} })));

export default never;
