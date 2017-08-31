/* eslint quote-props: ["error", "as-needed"] */

import { styled, mixins, theme } from 'client/utils'

const TOOLBAR_HEIGHT = 50

export const Input = styled('Input', {
  backgroundColor: '#ffffff',
  display: 'block',
  width: '100%',
  ...mixins.border,

  extend: [
    ...mixins.paddings('all', 'small'),
  ],
}, 'input')

export const Section = styled('Section', ({ side = 'vertical', amount = 'medium' }) => ({
  extend: [
    ...mixins.margins(side, amount),
  ],
}))

export const Text = styled('Text', ({ center }) => ({
  extend: [
    mixins.textAlignCenterIf(center),
  ],
}))

export const Heading = styled('Heading', ({ xxlarge, center }) => ({
  fontWeight: 'bold',
  fontSize: theme.fontSize.large,
  lineHeight: '1.25',

  extend: [
    mixins.fontSizeIf(xxlarge, theme.fontSize.xxlarge),
    mixins.textAlignCenterIf(center),
  ],
}))

export const ViewContainer = styled('ViewContainer', {
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  width: '40%',
  minWidth: '600px',
  paddingTop: TOOLBAR_HEIGHT,
})

export const Paper = styled('Paper', {
  backgroundColor: '#fff',

  ...mixins.border,
  borderRadius: '2px',

  extend: [
    ...mixins.margins('vertical', 'medium'),
    ...mixins.paddings('all', 'medium'),
  ],
})

export const Toolbar = styled('Toolbar', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: TOOLBAR_HEIGHT,

  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'flex-end',
})

export const LinkButton = styled('LinkButton', {
  border: '0 none',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '1.2px',

  transition: 'background-color 100ms linear',
  ':hover': {
    backgroundColor: 'gray',
  },

  extend: [
    ...mixins.paddings('horizontal', 'medium'),
    ...mixins.paddings('vertical', 'fine'),
  ],
}, 'button')
