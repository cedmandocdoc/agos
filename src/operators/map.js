import Stream from "../Stream";
import Transform from "../producers/Transform";

const map = fn => stream => new Stream(Transform.join(stream.producer, fn));

export default map;
