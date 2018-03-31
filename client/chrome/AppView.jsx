import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Link, Backdrop } from 'client/components';
import { deauthorize } from 'client/utils/platform';
import * as chromeActions from './actions';
import AuthView from './AuthView';
import ProgressLocker from './ProgressLocker';
import ScrollKeeper from './ScrollKeeper';

const styles = s.styles({
  appContainer: {
    display: 'grid',
    gridTemplateAreas: '"content"',

    largeScreen: {
      gridTemplateColumns: 'minmax(180px, 30%) var(--max-width) auto',
      gridTemplateAreas: '"sidemenu content whitespace"',
    },
  },

  navbarContainer: {
    gridArea: 'sidemenu',
    position: 'sticky',
    top: '0',

    display: 'none',

    largeScreen: {
      display: 'block',
    },
  },

  navbar: {
    padding: 'var(--spacing-small) var(--spacing-large)',
    height: '100vh',
    width: '100%',

    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-light)',
    fontSize: 'var(--font-size-medium)',

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
    justifySelf: 'center',
    padding: '0 var(--spacing-small)',
    width: '100%',
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

class AppView extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    route: PropTypes.object,
    view: PropTypes.node,
    toast: PropTypes.node,
    showToast: PropTypes.func.isRequired,
    isLockerVisible: PropTypes.bool.isRequired,
    isNavVisible: PropTypes.bool.isRequired,
    showNav: PropTypes.func.isRequired,
    isAuthorized: PropTypes.bool.isRequired,
  };

  toastTimeout = null;

  componentWillUpdate(nextProps) {
    // hide toast in few seconds
    if (nextProps.toast && this.props.toast !== nextProps.toast) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => this.props.showToast(null), 8000);
    }
  }

  logout = () => {
    deauthorize();
    window.location.reload();
  };

  renderNavbar() {
    const routeName = this.props.route ? this.props.route.name : null;

    const navbar = (
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

    return (
      <Fragment>
        <div className={styles.navbarContainer}>{navbar}</div>

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
      view,
      toast,
      isLockerVisible,
      isAuthorized,
      pathname,
      isPush,
    } = this.props;

    if (!isAuthorized) return <AuthView />;

    return (
      <div className={styles.appContainer}>
        <ScrollKeeper pathname={pathname} isPush={isPush} />

        {this.renderNavbar()}

        <div className={styles.viewContainer}>
          {view}
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

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
