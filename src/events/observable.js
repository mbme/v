import { removeMut } from '../shared/utils';

export default function observable(initialValue) {
  const subs = [];
  let value = initialValue;

  return {
    get value() {
      return value;
    },

    set(newValue) {
      value = newValue;
      subs.forEach(sub => sub(newValue));
    },

    on(sub) {
      subs.push(sub);
      return () => removeMut(subs, sub);
    },
  };
}
