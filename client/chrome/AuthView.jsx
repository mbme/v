import React, { PureComponent } from 'react';
import s from 'client/styles';
import { apiClient, authorize } from 'client/utils/platform';
import { Backdrop, Input, Styled } from 'client/components';

async function checkPassword(password) {
  await authorize(password);

  try {
    await apiClient.ping();
    window.location.reload();
  } catch (e) {
    console.error(e);
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
