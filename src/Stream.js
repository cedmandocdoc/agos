import Source from "./producers/Source";
import Safe from "./producers/Safe";

class Stream {
  constructor(producer) {
    if (typeof producer === "function")
      this.producer = new Safe(new Source(producer));
    else if (producer && typeof producer.run === "function")
      this.producer = producer;
    else
      throw new Error("producer should be a function or instance of Producer");
  }
}

export default Stream;
