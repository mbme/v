import { createRenderer } from 'fela';
import { render } from 'fela-dom';
import { isString, isObject } from 'shared/utils';

const renderer = createRenderer();

export const init = () => render(renderer);

const cleanupStyleObj = style => ({
  ...style,
  extend: undefined,
  condition: undefined,
});

function renderStyle(obj) {
  return [
    renderer.renderRule(() => cleanupStyleObj(obj)),
    ...(obj.extend || [])
      .filter(style => style.condition)
      .map(style => renderer.renderRule(() => cleanupStyleObj(style))),
  ];
}

function cx(...args) {
  return args.reduce((acc, val) => {
    if (!val) return acc;

    if (isString(val)) {
      acc.push(val);
    } else if (isObject(val)) {
      acc.push(...renderStyle(val));
    }

    return acc;
  }, []).join(' ');
}

const animation = keyframe => renderer.renderKeyframe(() => keyframe);

export default {
  cx,
  animation,
  withBorder: {
    border: 'var(--border)',
    boxShadow: 'var(--box-shadow)',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 'var(--font-size-large)',
    marginBottom: 'var(--spacing-medium)',
  },
  section: {
    marginBottom: 'var(--spacing-medium)',
  },
};
