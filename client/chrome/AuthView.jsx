import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { authorize } from 'client/utils/platform';
import { Backdrop, Input, Styled } from 'client/components';
import * as chromeActions from './actions';

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
    ping: PropTypes.func.isRequired,
  };

  state = {
    password: '',
  };

  onPasswordChange = password => this.setState({ password });

  onKeyDown = (e) => {
    if (e.key === 'Enter') this.checkPassword(this.state.password);
  };

  async checkPassword(password) {
    await authorize(password);

    try {
      await this.props.ping();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  }

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

const mapDispatchToProps = {
  ping: chromeActions.ping,
};

export default connect(null, mapDispatchToProps)(AuthView);
