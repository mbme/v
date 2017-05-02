import React from 'react'
import { observer } from 'mobx-react'
import { createComponent } from 'react-fela'

const Title = createComponent(({ fontSize = 18, color = 'red' }) => ({
  fontSize,
  color,
}))

function App () {
  return (
    <Title>HELLO WORLD!</Title>
  )
}

export default observer(App)
