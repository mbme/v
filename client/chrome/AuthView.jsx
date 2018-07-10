import React, { PureComponent } from 'react';
import log from '../../shared/log';
import s from '../styles';
import { api, authorize } from '../utils';
import { Backdrop, Input, Styled } from '../components';

async function checkPassword(password) {
  await authorize(password);

  try {
    await api.PING();
    window.location.reload();
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

export default class AuthView extends PureComponent {
  state = {
    password: '',
  };

  onPasswordChange = password => this.setState({ password });

  onKeyDown = (e) => {
    if (e.key === 'Enter') checkPassword(this.state.password);
  };

  render() {
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
