import Stream from "../Stream";
import Sink from "../Sink";
import Merge from "../producers/Merge";

class MergeLatest {
  constructor(streams) {
    this.streams = streams;
  }

  static join(producer, streams) {
    return producer instanceof MergeLatest
      ? new MergeLatest([...producer.streams, ...streams])
      : new MergeLatest([new Stream(producer), ...streams]);
  }

  run(sink, state) {
    const producer = new Merge(this.streams);

    return producer.run(new MergeLatestSink(sink, state, this.streams), state);
  }
}

class MergeLatestSink extends Sink {
  constructor(sink, state, streams) {
    super(sink, state);
    this.seen = [];
    this.values = [];
    for (let index = 0; index < streams.length; index++) {
      this.values.push(null);
    }
  }

  next(d, i) {
    this.values[i] = d; // mutates the current data
    if (!this.seen[i]) this.seen[i] = true;
    if (this.seen.length === this.values.length) this.sink.next(this.values);
  }
}

const mergeLatest = streams => new Stream(new MergeLatest(streams));

export default mergeLatest;
