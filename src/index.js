import Stream from "./Stream";

import of from "./operators/of";
import from from "./operators/from";
import empty from "./operators/empty";
import fail from "./operators/fail";
import never from "./operators/never";
import merge from "./operators/merge";
import mergeLatest from "./operators/mergeLatest";
import concat from "./operators/concat";

// transform
import map from "./operators/map";
import tap from "./operators/tap";

// filter
import filter from "./operators/filter";
import skipWhile from "./operators/skipWhile";

// slice
import slice from "./operators/slice";
import skip from "./operators/skip";
import take from "./operators/take";
import last from "./operators/last";

// period
import takeWhile from "./operators/takeWhile";

// accumulate
import scan from "./operators/scan";

// chain
import chain from "./operators/chain";
import join from "./operators/join";

// consume
import start from "./operators/start";

Stream.of = of;
Stream.from = from;
Stream.empty = empty;
Stream.fail = fail;
Stream.never = never;
Stream.merge = merge;
Stream.mergeLatest = mergeLatest;
Stream.concat = concat;

// transform
Stream.prototype.map = function(fn) {
  return map(fn)(this);
};

Stream.prototype.tap = function(fn) {
  return tap(fn)(this);
};

// filter
Stream.prototype.filter = function(fn) {
  return filter(fn)(this);
};

Stream.prototype.skipWhile = function(fn) {
  return skipWhile(fn)(this);
};

// slice
Stream.prototype.slice = function(start, end) {
  return slice(start, end)(this);
};

Stream.prototype.skip = function(amount) {
  return skip(amount)(this);
};

Stream.prototype.take = function(amount) {
  return take(amount)(this);
};

Stream.prototype.last = function() {
  return last(this);
};

// period
Stream.prototype.takeWhile = function(amount) {
  return takeWhile(amount)(this);
};

// accumulate
Stream.prototype.scan = function(fn, seed) {
  return scan(fn, seed)(this);
};

// chain
Stream.prototype.chain = function(fn) {
  return chain(fn)(this);
};

Stream.prototype.join = function(level) {
  return join(level)(this);
};

// consume
Stream.prototype.start = function(sink) {
  return start(sink)(this);
};

export default Stream;
