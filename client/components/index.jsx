import { styled, mixins } from 'client/utils'

export const Input = styled({
  padding: '0.5em',
  backgroundColor: '#ffffff',
  display: 'block',
  width: '100%',
  ...mixins.border,
}, 'input')

export const Section = styled(({ margin = 'medium' }) => ({
  extend: [
    {
      condition: margin === 'large',
      style: {
        margin: '2rem 0',
      },
    },
    {
      condition: margin === 'medium',
      style: {
        margin: '1rem 0',
      },
    },
    {
      condition: margin === 'small',
      style: {
        margin: '0.5rem 0',
      },
    },
  ],
}))

export const Text = styled(({ center }) => ({
  extend: [
    {
      condition: center,
      style: {
        textAlign: 'center',
      },
    },
  ],
}))
