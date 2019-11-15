import Stream from "../Stream";
import Sink from "../Sink";
import Merge from "./Merge";

class MergeLatest {
  constructor(streams) {
    this.streams = streams;
  }

  static join(producer, streams) {
    return producer instanceof MergeLatest
      ? new MergeLatest([...producer.streams, ...streams])
      : new MergeLatest([new Stream(producer), ...streams]);
  }

  run(sink) {
    const producer = new Merge(this.streams);
    return producer.run(new MergeLatestSink(sink, this.streams));
  }
}

class MergeLatestSink extends Sink {
  constructor(sink, streams) {
    super(sink);
    this.seen = [];
    this.values = [];
    this.length = streams.length;
  }

  next(d, i) {
    this.values[i] = d; // mutates the current data
    if (!this.seen[i]) this.seen[i] = true;
    if (this.seen.length === this.length) this.sink.next(this.values);
  }
}

export default MergeLatest;
