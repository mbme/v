import React from 'react'

export { default as Link } from './Link'
export { default as Textarea } from './Textarea'
export { LightInput, FormInput } from './Input'
export { Modal, ConfirmationDialog } from './Modal'
export { default as Icon } from './Icon'
export { default as Toolbar } from './Toolbar'
export * from './Button'

export const genOptions = options => Object.entries(options).map(([ key, label ]) => <option key={key} value={key}>{label}</option>)
