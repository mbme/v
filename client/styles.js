import { createRenderer } from 'fela';
import { render } from 'fela-dom';
import { isString, isObject } from 'shared/utils';

const renderer = createRenderer();

export function init() {
  const styleLink = document.createElement('link');
  styleLink.href = '/styles.css';
  styleLink.rel = 'stylesheet';
  document.head.append(styleLink);

  render(renderer);
}

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

const flex = ({ h, v, column = false, wrap = true } = {}) => ({
  display: 'flex',
  extend: [
    {
      condition: h,
      justifyContent: h,
    },
    {
      condition: v,
      alignItems: v,
    },
    {
      condition: column,
      flexDirection: 'column',
    },
    {
      condition: !wrap,
      flexWrap: 'nowrap',
    },
  ],
});

export default {
  cx,
  animation,
  flex,
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
