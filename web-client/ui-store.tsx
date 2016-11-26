import {action, observable, asMap, ObservableMap} from 'mobx'
import 'react'

export default class UIStore {
  @observable pieces: ObservableMap<JSX.Element> = asMap<JSX.Element>({})

  @action
  addPiece(key: string, el: JSX.Element): void {
    this.pieces.set(key, el)
  }
}
