import { createRenderer, combineRules } from 'fela';
import { render } from 'fela-dom';
import { isString, isObject } from 'shared/utils';

const SCREEN = {
  small: 320,
  medium: 768,
  large: 1024,
};

const renderer = createRenderer({
  plugins: [
    style => ({ ...style, extend: undefined, condition: undefined }), // remove `extend` and `condition`
  ],
  mediaQueryOrder: [
    `only screen and (min-width: ${SCREEN.small}px)`,
    `only screen and (min-width: ${SCREEN.medium}px)`,
    `only screen and (min-width: ${SCREEN.large}px)`,
  ],
});

export function init() {
  const styleLink = document.createElement('link');
  styleLink.href = '/styles.css';
  styleLink.rel = 'stylesheet';
  document.head.append(styleLink);

  render(renderer);
}

function renderStyle(obj) {
  const rules = (obj.extend || [])
    .filter(style => style.hasOwnProperty('condition') ? style.condition : true)
    .map(style => () => style);

  return renderer.renderRule(combineRules(() => obj, ...rules));
}

function cx(...args) {
  return args.reduce((acc, val) => {
    if (!val) return acc;

    if (isString(val)) {
      acc.push(val);
    } else if (isObject(val)) {
      acc.push(renderStyle(val));
    }

    return acc;
  }, []).join(' ');
}

const animation = keyframe => renderer.renderKeyframe(() => keyframe);

const flex = ({ h, v, column = false, wrap } = {}) => ({
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
      condition: wrap === true,
      flexWrap: 'wrap',
    },
    {
      condition: wrap === false,
      flexWrap: 'nowrap',
    },
  ],
});

const minWidth = (width, styles) => ({
  [`@media only screen and (min-width: ${width})`]: styles,
});

const onMediumScreen = styles => minWidth(SCREEN.medium + 'px', styles);
const onLargeScreen = styles => minWidth(SCREEN.large + 'px', styles);

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

  onMediumScreen,
  onLargeScreen,
};
