import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Link } from 'client/components';
import { deauthorize } from 'client/utils/platform';
import * as chromeActions from './actions';
import AuthView from './AuthView';
import ProgressLocker from './ProgressLocker';

const styles = s.styles({
  appContainer: {
    display: 'grid',
    gridTemplateAreas: '"content"',

    largeScreen: {
      gridTemplateColumns: 'minmax(180px, 30%) var(--max-width) auto',
      gridTemplateAreas: '"sidemenu content whitespace"',
    },
  },

  navbarContainer: isNavVisible => ({
    gridArea: 'sidemenu',

    backgroundColor: 'var(--color-secondary)',
    color: 'white',
    fontSize: 'var(--font-size-medium)',

    position: 'relative',
    display: 'none',

    largeScreen: {
      display: 'block',
    },

    extend: [
      {
        condition: isNavVisible,
        display: 'block',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '1',
      },
    ],
  }),

  navbar: {
    padding: 'var(--spacing-small) var(--spacing-large)',
    height: '100vh',
    position: 'sticky',
    top: '0',

    extend: [
      s.flex({ column: true, v: 'flex-end' }),
    ],
  },

  navLink: isSelected => ({
    display: 'inline-block',
    margin: 'var(--spacing-medium) 0',
    extend: [
      {
        condition: isSelected,
        color: 'var(--color-primary)',
      },
    ],
  }),

  logout: {
    position: 'absolute',
    bottom: 'var(--spacing-small)',
  },

  viewContainer: {
    gridArea: 'content',
    padding: '0 var(--spacing-small)',
    justifySelf: 'center',
    maxWidth: 'var(--max-width)',

    mediumScreen: {
      padding: '0 var(--spacing-medium)',
    },

    largeScreen: {
      padding: '0 var(--spacing-large)',
    },

    extend: [
      s.flex({ column: true }),
    ],
  },

  toastContainer: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: 'var(--max-width)',
    backgroundColor: '#323232',
    color: '#ffffff',
    borderRadius: '2px',
    textAlign: 'center',
    padding: 'var(--spacing-medium)',
    ':empty': {
      display: 'none',
    },
  },
});

// Switch off the native scroll restoration behavior and handle it manually
// https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

class App extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    route: PropTypes.object,
    view: PropTypes.node,
    toast: PropTypes.node,
    showToast: PropTypes.func.isRequired,
    isLockerVisible: PropTypes.bool.isRequired,
    isNavVisible: PropTypes.bool.isRequired,
    showNav: PropTypes.func.isRequired,
    isAuthorized: PropTypes.bool.isRequired,
  };

  scrollPos = {};
  toastTimeout = null;

  componentWillUpdate(nextProps) {
    if (this.props.pathname !== nextProps.pathname) {
      // save scroll pos
      this.scrollPos[this.props.pathname] = { offsetX: window.pageXOffset, offsetY: window.pageYOffset };
    }

    // hide toast in few seconds
    if (nextProps.toast && this.props.toast !== nextProps.toast) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => this.props.showToast(null), 8000);
    }
  }

  componentDidUpdate() {
    const { isPush, pathname } = this.props;

    if (isPush) {
      delete this.scrollPos[pathname]; // delete stored scroll position for the next page
      window.scrollTo(0, 0);
    } else {
      // try to restore scroll position
      const { offsetX, offsetY } = this.scrollPos[pathname] || { offsetX: 0, offsetY: 0 };
      window.scrollTo(offsetX, offsetY);
    }
  }

  logout = () => {
    deauthorize();
    window.location.reload();
  };

  renderNavbar() {
    const routeName = this.props.route ? this.props.route.name : null;

    return (
      <nav className={styles.navbar}>
        <Link
          clean
          to={{ name: 'notes' }}
          className={styles.navLink([ 'notes', 'add-note', 'note', 'note-editor' ].includes(routeName))}
        >
          Notes
        </Link>

        <Link
          clean
          to={{ name: 'tracks' }}
          className={styles.navLink(routeName === 'tracks')}
        >
          Tracks
        </Link>

        <Link
          clean
          to={{ name: 'theme' }}
          className={styles.navLink(routeName === 'theme')}
        >
          Theme
        </Link>

        <div className={styles.logout} onClick={this.logout}>
          Logout
        </div>
      </nav>
    );
  }

  hideNav = () => this.props.showNav(false);

  render() {
    const { view, isLoading, toast, isLockerVisible, isNavVisible, isAuthorized } = this.props;

    if (!isAuthorized) return <AuthView />;

    return (
      <div className={styles.appContainer}>
        <div className={styles.navbarContainer(isNavVisible)} onClick={this.hideNav}>
          {this.renderNavbar()}
        </div>
        <div className={styles.viewContainer}>
          {!isLoading && view}
        </div>
        <div className={styles.toastContainer}>
          {toast}
        </div>
        {isLockerVisible && <ProgressLocker />}
      </div>
    );
  }
}

const mapStateToProps = ({ router, chrome }) => ({
  pathname: router.pathname,
  isPush: router.isPush,
  isLoading: router.isLoading,
  view: router.view,
  route: router.route,
  toast: chrome.toast,
  isLockerVisible: router.isLoading || chrome.showLocker,
  isNavVisible: chrome.showNav,
  isAuthorized: chrome.isAuthorized,
});

const mapDispatchToProps = {
  showToast: chromeActions.showToast,
  showNav: chromeActions.showNav,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
