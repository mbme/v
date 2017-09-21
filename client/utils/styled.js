import { createComponent } from 'react-fela'
import { isFunction, isString, isObject } from 'shared/utils'

export const theme = {
  fontSize: {
    xxlarge: '3.157rem',
    xlarge: '2.369rem',
    large: '1.777rem',
    medium: '1rem',
    small: '.875rem',
    fine: '.75rem',
  },
  spacing: {
    xxlarge: '8rem',
    xlarge: '4rem',
    large: '2rem',
    medium: '1rem',
    small: '0.5rem',
    fine: '0.25rem',
  },
  toolbarHeight: 50,
}

function getSide(side) {
  return {
    top: ['all', 'vertical', 'top'].includes(side),
    right: ['all', 'horizontal', 'right'].includes(side),
    bottom: ['all', 'vertical', 'bottom'].includes(side),
    left: ['all', 'horizontal', 'left'].includes(side),
  }
}

export const createCondition = (cond, property, value) => ({
  condition: cond,
  style: {
    [property]: value,
  },
})

export const mixins = {
  border: {
    border: '1px solid rgba(0,0,0,.09)',
    boxShadow: '0 1px 4px rgba(0,0,0,.04)',
  },

  limitWidth: {
    maxWidth: '800px',
    minWidth: '600px',
  },

  fontSizeIf: (cond, value) => createCondition(cond, 'fontSize', value),

  textAlignCenterIf: cond => createCondition(cond, 'textAlign', 'center'),

  margins(side, amount) {
    const { top, bottom, left, right } = getSide(side)
    const value = theme.spacing[amount]

    return [
      createCondition(top, 'marginTop', value),
      createCondition(right, 'marginRight', value),
      createCondition(bottom, 'marginBottom', value),
      createCondition(left, 'marginLeft', value),
    ]
  },

  paddings(side, amount) {
    const { top, bottom, left, right } = getSide(side)
    const value = theme.spacing[amount]

    return [
      createCondition(top, 'paddingTop', value),
      createCondition(right, 'paddingRight', value),
      createCondition(bottom, 'paddingBottom', value),
      createCondition(left, 'paddingLeft', value),
    ]
  },
}

function extractUsedProps(rule) {
  const handler = props => ({
    get(target, key) {
      if (isObject(target[key])) {
        props.push(key)
        return target[key]
      }

      props.push(key)
      return target[key]
    },
  })

  const usedProps = []
  const proxy = new Proxy({ theme }, handler(usedProps))
  rule(proxy)

  return usedProps
}

export function styled(name, styles, type = 'div') {
  if (!isString(name)) {
    throw new Error('styled: "name" must be a string')
  }

  const usedProps = ['innerRef']
  let rule = styles
  if (isFunction(rule)) {
    usedProps.push(...extractUsedProps(styles))
  } else {
    rule = () => styles
  }

  function passThroughUnusedProps(props) {
    return Object.keys(props).filter(k => !usedProps.includes(k))
  }

  const component = createComponent(rule, type, passThroughUnusedProps)
  component.displayName = name

  return component
}
