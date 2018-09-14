export default function apiProxy(onAction) {
  return new Proxy({}, {
    get(target, prop) {
      return (data, newFiles) => onAction({ name: prop, data }, newFiles || []);
    },
  });
}
