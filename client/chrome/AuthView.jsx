import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import s from 'client/styles'
import { setPassword } from 'client/utils/network'
import { Backdrop, FormInput } from 'client/components'
import * as notesActions from 'client/notes/actions'

const BackdropStyles = s.cx({
  backgroundColor: 'var(--bg-color)',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: '20vh',
})

const InputStyles = s.cx({
  width: '300px',
})

const Logo = s.cx({
  width: '150px',
  marginBottom: 'var(--spacing-medium)',
})

class AuthView extends PureComponent {
  static propTypes = {
    listNotes: PropTypes.func.isRequired,
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
    await setPassword(password)

    try {
      await this.props.listNotes()
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    return (
      <Backdrop className={BackdropStyles}>
        <img alt="logo" src="/logo.svg" className={Logo} />
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
}

export default connect(null, mapDispatchToProps)(AuthView)
