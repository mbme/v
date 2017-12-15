import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import s from 'client/styles'
import { Backdrop, FormInput } from 'client/components'
import * as notesActions from 'client/notes/actions'
import * as chromeActions from 'client/chrome/actions'

const BackdropStyles = s.cx({
  backgroundColor: 'var(--bg-color)',
  paddingTop: '35vh',
})

const InputStyles = s.cx({
  width: '300px',
})

class AuthView extends PureComponent {
  static propTypes = {
    listNotes: PropTypes.func.isRequired,
    setAuthorized: PropTypes.func.isRequired,
  }

  static contextTypes = {
    apiClient: PropTypes.object.isRequired,
  }

  state = {
    password: '',
  }

  onPasswordChange = password => this.setState({ password })

  onKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.checkPassword(this.state.password)
    }
  }

  async checkPassword(password) {
    await this.context.apiClient.setPassword(password)
    try {
      await this.props.listNotes()
      this.props.setAuthorized(true)
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    return (
      <Backdrop className={BackdropStyles}>
        <FormInput
          className={InputStyles}
          name="password"
          type="password"
          autoFocus
          value={this.state.password}
          onChange={this.onPasswordChange}
          onKeyDown={this.onKeyDown}
        />
      </Backdrop>
    )
  }
}

const mapDispatchToProps = {
  listNotes: notesActions.listNotes,
  setAuthorized: chromeActions.setAuthorized,
}

export default connect(null, mapDispatchToProps)(AuthView)
