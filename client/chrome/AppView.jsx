import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import s from '../styles';
import { inject } from '../store';
import { Link, Backdrop } from '../components';
import { deauthorize } from '../utils';
import AuthView from './AuthView';
import Router from './Router';
import ProgressLocker from './ProgressLocker';
import NetworkEventsObserver from './NetworkEventsObserver';
import Toaster from './Toaster';

class AppView extends PureComponent {
  static propTypes = {
    route: PropTypes.object,
    isNavVisible: PropTypes.bool.isRequired,
    showNav: PropTypes.func.isRequired,
    isAuthorized: PropTypes.bool,
    isLockerVisible: PropTypes.bool.isRequired,
  };

  logout = () => {
    deauthorize();
    window.location.reload();
  };

  renderNavbar() {
    const routeName = this.props.route ? this.props.route.name : null;

    const isNoteNavTree = [ 'notes', 'add-note', 'note', 'note-editor' ].includes(routeName);

    const navbar = (
      <nav className="AV-navbar">
        <Link
          clean
          to={{ name: 'notes' }}
          className={s.cn('AV-navlink', { 'is-selected': isNoteNavTree })}
        >
          Notes
        </Link>

        <Link
          clean
          to={{ name: 'theme' }}
          className={s.cn('AV-navlink', { 'is-selected': routeName === 'theme' })}
        >
          Theme
        </Link>

        <div className="AV-logout" onClick={this.logout}>
          Logout
        </div>
      </nav>
    );

    return (
      <Fragment>
        <div className="AV-navbar-container">{navbar}</div>

        {this.props.isNavVisible && (
          <Backdrop onClick={() => this.props.showNav(false)}>
            {navbar}
          </Backdrop>
        )}
      </Fragment>
    );
  }

  render() {
    const {
      isAuthorized,
      isLockerVisible,
    } = this.props;

    if (!isAuthorized) {
      return (
        <Fragment>
          <AuthView />
          <NetworkEventsObserver />
          {isLockerVisible && <ProgressLocker />}
        </Fragment>
      );
    }

    return (
      <div className="AV-container">
        {this.renderNavbar()}

        <div className="AV-view">
          <Router />
        </div>

        <Toaster />
        <NetworkEventsObserver />
        {isLockerVisible && <ProgressLocker />}
      </div>
    );
  }
}

const mapStoreToProps = (state, actions) => ({
  isLockerVisible: state.showLocker,
  isNavVisible: state.showNav,
  isAuthorized: state.isAuthorized,
  showNav: actions.showNav,
  route: state.route,
});

export default inject(mapStoreToProps, AppView);
