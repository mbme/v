import { isString } from 'shared/utils'

export default {
  Paper: 'Paper with-border',
  Heading: 'heading',
  FlatButton: 'CleanButton FlatButton',
  RaisedButton: 'CleanButton with-border',
  cx: (...args) => args.filter(arg => arg && isString(arg)).join(' '),
}
