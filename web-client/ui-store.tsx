import {action, observable} from 'mobx'
import 'react'

export default class UIStore {
  @observable pieces: JSX.Element[] = []

  @action
  addPiece(el: JSX.Element): void {
    this.pieces.push(el)
  }
}
