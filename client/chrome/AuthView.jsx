import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { inject } from '../store';
import log from '../../shared/log';
import s from '../styles';
import { api, authorize } from '../utils';
import { Backdrop, Input, Styled } from '../components';

async function checkPassword(password) {
  await authorize(password);

  try {
    await api.PING();
  } catch (e) {
    log.error('auth failed', e);
  }
}

const styles = s.styles({
  backdrop: {
    backgroundColor: 'var(--bg-color)',
    paddingTop: '20vh',
    extend: [
      s.flex({ column: true, h: 'flex-start', v: 'center' }),
    ],
  },
  logo: {
    width: '150px',
    marginBottom: 'var(--spacing-medium)',
  },
});

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
      <Backdrop className={styles.backdrop}>
        <img alt="logo" src="/logo.svg" className={styles.logo} />
        <Styled
          as={Input}
          $width="300px"
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
