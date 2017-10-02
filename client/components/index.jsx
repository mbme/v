import React from 'react'
import { styled, mixins, theme } from 'client/utils'

export { default as Link } from './Link'
export { default as Textarea } from './Textarea'
export { default as Input } from './Input'
export { Modal, ConfirmationDialog } from './Modal'
export { default as Icon } from './Icon'
export { default as Toolbar } from './Toolbar'
export * from './Button'

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
  paddingTop: theme.toolbarHeight,
  ...mixins.limitWidth,
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

export const Flex = styled('Flex', ({ justifyContent = 'center' }) => ({
  display: 'flex',
  justifyContent,
}))

export function NotFoundView() {
  return (
    <ViewContainer>
      <Heading>NOT FOUND</Heading>
    </ViewContainer>
  )
}

export function LoadingView() {
  return (
    <ViewContainer>
      <Heading>LOADING...</Heading>
    </ViewContainer>
  )
}
