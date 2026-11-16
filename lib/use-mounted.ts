import * as React from "react";

// Nothing to subscribe to: the snapshot only ever changes from server to client.
const emptySubscribe = () => () => {};

/**
 * The hydration-safe mount guard for theme-dependent UI. False during server rendering and
 * hydration, true on the client afterwards, without a setState-in-effect. Render a stable
 * placeholder until it is true.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
