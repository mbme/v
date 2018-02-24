import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { authorize } from 'client/utils/platform';
import { Backdrop, Input } from 'client/components';
import * as chromeActions from './actions';

const backdropStyles = s.cx({
  backgroundColor: 'var(--bg-color)',
  paddingTop: '20vh',
}, s.flex({ column: true, h: 'flex-start', v: 'center' }));

const inputStyles = s.cx({
  width: '300px',
});

const logoStyles = s.cx({
  width: '150px',
  marginBottom: 'var(--spacing-medium)',
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
      <Backdrop className={backdropStyles}>
        <img alt="logo" src="/logo.svg" className={logoStyles} />
        <Input
          className={inputStyles}
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
