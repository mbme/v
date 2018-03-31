import { createRenderer, combineRules } from 'fela';
import { render } from 'fela-dom';
import { isString, isObject, isFunction, flatten } from 'shared/utils';

const SCREEN = {
  small: 320,
  medium: 768,
  large: 1024,
};

const minWidth = (width, prefix = true) => `${prefix ? '@media ' : ''}only screen and (min-width: ${width}px)`;

const renderer = createRenderer({
  plugins: [
    // remove extend, mediumScreen, largeScreen
    ({ mediumScreen, largeScreen, extend, ...style }) => {
      const result = style;

      if (mediumScreen) {
        result[minWidth(SCREEN.medium)] = mediumScreen;
      }

      if (largeScreen) {
        result[minWidth(SCREEN.large)] = largeScreen;
      }

      return result;
    },
  ],
  mediaQueryOrder: [
    minWidth(SCREEN.small, false),
    minWidth(SCREEN.medium, false),
    minWidth(SCREEN.large, false),
  ],
});

export function init() {
  const styleLink = document.createElement('link');
  styleLink.href = '/styles.css';
  styleLink.rel = 'stylesheet';
  document.head.append(styleLink);

  render(renderer);
}

export function flattenStyles(obj) {
  if (!isObject(obj)) return [];

  const styles = flatten((obj.extend || []).map(flattenStyles));

  const result = obj;

  delete result.extend;

  return [ result, ...styles ];
}

function renderStyles(obj) {
  const rules = flattenStyles(obj).map(style => () => style);

  return renderer.renderRule(combineRules(...rules));
}

function cx(...args) {
  return args.reduce((acc, val) => {
    if (!val) return acc;

    if (isString(val)) {
      acc.push(val);
    } else if (isObject(val)) {
      acc.push(renderStyles(val));
    }

    return acc;
  }, []).join(' ');
}

function stylesObject(obj) {
  const result = {};

  Object.entries(obj).forEach(([ key, value ]) => {
    result[key] = isFunction(value) ? (...props) => cx(value(...props)) : cx(value);
  });

  return result;
}

const animation = keyframe => renderer.renderKeyframe(() => keyframe);

const flex = ({ h, v, column = false, wrap } = {}) => ({
  display: 'flex',

  extend: [
    h && {
      justifyContent: h,
    },
    v && {
      alignItems: v,
    },
    column && {
      flexDirection: 'column',
    },
    wrap === true && {
      flexWrap: 'wrap',
    },
    wrap === false && {
      flexWrap: 'nowrap',
    },
  ],
});

export default {
  cx,
  styles: stylesObject,
  animation,
  flex,
};
