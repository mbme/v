import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {action, observable, useStrict} from 'mobx'
import {observer} from 'mobx-react'
import DevTools from 'mobx-react-devtools'

// webpack variable: true if dev mode enabled
declare const __DEV__: boolean

// do not allow to modify state out of actions
useStrict(true)

class AppState {
  @observable timer: number = 0

  constructor() {
    setInterval(this.updateTimer, 1000)
  }

  @action updateTimer = () => {
    this.timer += 1
  }

  @action resetTimer = () => {
    this.timer = 0
  }
}

@observer
class TimerView extends React.Component<{appState: AppState}, {}> {
  render(): JSX.Element {
    const devTools = __DEV__ ? <DevTools /> : undefined
    return (
      <div>
        <button onClick={this.onReset}>
          Seconds passed: {this.props.appState.timer}
        </button>
        {devTools}
      </div>
    )
  }

  onReset = () => {
    this.props.appState.resetTimer()
  }
};

const appState =  new AppState()

ReactDOM.render(
  <TimerView appState={appState} />,
  document.getElementById('app')
)
