import 'react'

export interface IListItem {
  readonly key: string,
  readonly el: JSX.Element | string,
  readonly onClick?: () => void,
}
