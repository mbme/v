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
import Toaster from './Toaster';

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
    position: 'sticky',
    top: 0,

    height: '100vh',
    width: '100%',
    padding: 'var(--spacing-small) var(--spacing-large)',

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
      isSelected && {
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
});

class AppView extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    route: PropTypes.object,
    view: PropTypes.node,
    isLockerVisible: PropTypes.bool.isRequired,
    isNavVisible: PropTypes.bool.isRequired,
    showNav: PropTypes.func.isRequired,
    isAuthorized: PropTypes.bool.isRequired,
  };

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

        <Toaster />

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
  isLockerVisible: router.isLoading || chrome.showLocker,
  isNavVisible: chrome.showNav,
  isAuthorized: chrome.isAuthorized,
});

const mapDispatchToProps = {
  showNav: chromeActions.showNav,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
