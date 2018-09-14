import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { inject } from '../store';
import log from '../../logger';
import { api } from '../utils';
import { authorize } from '../utils/auth';
import { Backdrop, Input } from '../components';

async function checkPassword(password) {
  await authorize(password);

  try {
    await api.PING();
  } catch (e) {
    log.error('auth failed', e);
  }
}

class AuthView extends PureComponent {
  static propTypes = {
    isAuthorized: PropTypes.bool,
  };

  state = {
    password: '',
  };

  componentDidMount() {
    if (this.props.isAuthorized === undefined) {
      api.PING();
    }
  }

  onPasswordChange = password => this.setState({ password });

  onKeyDown = (e) => {
    if (e.key === 'Enter') checkPassword(this.state.password);
  };

  render() {
    if (this.props.isAuthorized === undefined) {
      return null;
    }

    return (
      <Backdrop className="Auth-backdrop">
        <img alt="logo" src="/logo.svg" className="Auth-logo" />
        <Input
          className="Auth-input"
          name="password"
          type="password"
          autoFocus
          value={this.state.password}
          onChange={this.onPasswordChange}
          onKeyDown={this.onKeyDown}
        />
      </Backdrop>
    );
  }
}

const mapStoreToProps = state => ({
  isAuthorized: state.isAuthorized,
});

export default inject(mapStoreToProps, AuthView);
