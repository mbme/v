export default function pubSub() {
  const subs = new Map();

  const getEventSubs = name => (subs.get(name) || new Set());

  return {
    on(name, handler) {
      const eventSubs = getEventSubs(name);
      eventSubs.add(handler);

      subs.set(name, eventSubs);
    },

    off(name, handler) {
      const eventSubs = getEventSubs(name);
      eventSubs.delete(handler);

      if (!eventSubs.length) {
        subs.delete(name);
      }
    },

    emit(name, params) {
      getEventSubs(name).forEach(handler => handler(params));
    },
  };
}
