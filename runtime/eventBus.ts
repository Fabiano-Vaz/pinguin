import type { RuntimeConfig, RuntimeEventApi, RuntimeEventHandler, RuntimeEventName } from './types';

type RuntimeWithInternals = RuntimeConfig & {
  __eventTarget?: EventTarget;
  __listenerRegistry?: Map<RuntimeEventName, Map<RuntimeEventHandler, EventListener>>;
};

const ensureRuntimeEventApi = (runtime: RuntimeWithInternals): RuntimeConfig => {
  if (runtime.onEvent && runtime.offEvent && runtime.emitEvent) {
    return runtime;
  }

  runtime.__eventTarget = runtime.__eventTarget ?? new EventTarget();
  runtime.__listenerRegistry = runtime.__listenerRegistry ?? new Map();

  const onEvent: RuntimeEventApi['onEvent'] = (eventName, handler) => {
    if (!runtime.__eventTarget || !runtime.__listenerRegistry) return;

    const listener: EventListener = (event) => {
      const customEvent = event as CustomEvent<unknown>;
      handler(customEvent.detail as never);
    };

    const byEvent = runtime.__listenerRegistry.get(eventName) ?? new Map();
    byEvent.set(handler as RuntimeEventHandler, listener);
    runtime.__listenerRegistry.set(eventName, byEvent);
    runtime.__eventTarget.addEventListener(eventName, listener);
  };

  const offEvent: RuntimeEventApi['offEvent'] = (eventName, handler) => {
    const listener = runtime.__listenerRegistry?.get(eventName)?.get(handler as RuntimeEventHandler);
    if (!listener || !runtime.__eventTarget) return;

    runtime.__eventTarget.removeEventListener(eventName, listener);
    runtime.__listenerRegistry?.get(eventName)?.delete(handler as RuntimeEventHandler);
  };

  const emitEvent: RuntimeEventApi['emitEvent'] = (eventName, payload) => {
    runtime.__eventTarget?.dispatchEvent(new CustomEvent(String(eventName), { detail: payload }));
  };

  runtime.onEvent = onEvent;
  runtime.offEvent = offEvent;
  runtime.emitEvent = emitEvent;

  return runtime;
};

export const ensureRuntimeBridge = (runtime: RuntimeConfig = {}): RuntimeConfig => {
  const connectedRuntime = ensureRuntimeEventApi(runtime as RuntimeWithInternals);
  window.PINGUIN_RUNTIME = connectedRuntime;
  return connectedRuntime;
};
