import Stream from "./Stream";

import of from "./operators/of";
import from from "./operators/from";
import empty from "./operators/empty";
import fail from "./operators/fail";
import never from "./operators/never";
import merge from "./operators/merge";
import mergeLatest from "./operators/mergeLatest";
import concat from "./operators/concat";
import map from "./operators/map";
import tap from "./operators/tap";
import filter from "./operators/filter";
import skip from "./operators/skip";
import skipWhile from "./operators/skipWhile";
import take from "./operators/take";
import takeWhile from "./operators/takeWhile";
import scan from "./operators/scan";
import last from "./operators/last";
import chain from "./operators/chain";
import join from "./operators/join";
import start from "./operators/start";

Stream.of = of;
Stream.from = from;
Stream.empty = empty;
Stream.fail = fail;
Stream.never = never;
Stream.merge = merge;
Stream.mergeLatest = mergeLatest;
Stream.concat = concat;

Stream.prototype.tap = function(fn) {
  return tap(fn)(this);
};

Stream.prototype.map = function(fn) {
  return map(fn)(this);
};

Stream.prototype.filter = function(fn) {
  return filter(fn)(this);
};

Stream.prototype.skip = function(amount) {
  return skip(amount)(this);
};

Stream.prototype.skipWhile = function(fn) {
  return skipWhile(fn)(this);
};

Stream.prototype.take = function(amount) {
  return take(amount)(this);
};

Stream.prototype.takeWhile = function(amount) {
  return takeWhile(amount)(this);
};

Stream.prototype.scan = function(fn, seed) {
  return scan(fn, seed)(this);
};

Stream.prototype.last = function() {
  return last(this);
};

Stream.prototype.chain = function(fn) {
  return chain(fn)(this);
};

Stream.prototype.join = function() {
  return join(this);
};

Stream.prototype.start = function(sink) {
  return start(sink)(this);
};

export default Stream;
