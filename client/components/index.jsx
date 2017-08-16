import { styled, mixins, theme } from 'client/utils'

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
