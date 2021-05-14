import { CancelInterceptor } from "./Stream";
import empty from "./operators/empty";
import { noop } from "./utils";

export const observable = stream => {
  return {
    subscribe: observer => {
      const sink = { next: noop, error: noop, complete: noop };

      if (typeof observer === "function") sink.next = observer;
      else {
        sink.next = observer.next;
        sink.error = observer.error;
        sink.complete = observer.complete;
      }

      const cancel = CancelInterceptor.join(empty());

      stream.listen(noop, sink.next, sink.error, sink.complete, cancel);

      return { unsubscribe: () => cancel.run() };
    }
  };
};
