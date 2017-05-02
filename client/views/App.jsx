import React from 'react'
import { observer } from 'mobx-react'
import { createComponent } from 'react-fela'

import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'

const Title = createComponent(({ fontSize = 18, color = 'red' }) => ({
  fontSize,
  color,
}))

function App () {
  return (
    <Paper>
      <Title>HELLO WORLD!</Title>
      <RaisedButton label="Default" />
    </Paper>
  )
}

export default observer(App)
