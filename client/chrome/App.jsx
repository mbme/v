import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Link } from 'client/components';
import { deauthorize } from 'client/utils/platform';
import { showToast } from './actions';
import AuthView from './AuthView';
import ProgressLocker from './ProgressLocker';

const appContainerStyles = s.cx({
  display: 'grid',
  gridTemplateColumns: '30% var(--max-width) auto',
});

const navbarContainerStyles = s.cx({
  gridArea: '1 / 1 / 1 / 1',
  position: 'relative',
  backgroundColor: 'var(--color-secondary)',
  color: 'white',
});

const navbarStyles = s.cx({
  padding: 'var(--spacing-small) var(--spacing-large)',
  height: '100vh',
  position: 'sticky',
  top: '0px',
  fontSize: 'var(--font-size-medium)',
}, s.flex({ column: true, v: 'flex-end' }));

const navLinkStyles = isSelected => s.cx({
  display: 'inline-block',
  margin: 'var(--spacing-medium) 0',
  extend: [
    {
      condition: isSelected,
      color: 'var(--color-primary)',
    },
  ],
});

const logoutStyles = s.cx({
  position: 'absolute',
  bottom: 'var(--spacing-small)',
});

const viewContainerStyles = s.cx({
  gridArea: '1 / 2 / 1 / 2',

  padding: '0 var(--spacing-large)',
}, s.flex({ column: true }));


const toastContainerStyles = s.cx({
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
});

class App extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    route: PropTypes.object,
    view: PropTypes.node,
    toast: PropTypes.node,
    showToast: PropTypes.func.isRequired,
    showLocker: PropTypes.bool.isRequired,
    authorized: PropTypes.bool.isRequired,
  };

  scrollPos = {};
  toastTimeout = null;

  constructor(props) {
    super(props);

    // Switch off the native scroll restoration behavior and handle it manually
    // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }

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
      <nav className={navbarStyles}>
        <Link
          clean
          to={{ name: 'notes' }}
          className={navLinkStyles([ 'notes', 'add-note', 'note', 'note-editor' ].includes(routeName))}
        >
          Notes
        </Link>

        <Link
          clean
          to={{ name: 'tracks' }}
          className={navLinkStyles(routeName === 'tracks')}
        >
          Tracks
        </Link>

        <Link
          clean
          to={{ name: 'theme' }}
          className={navLinkStyles(routeName === 'theme')}
        >
          Theme
        </Link>

        <div className={logoutStyles} onClick={this.logout}>
          Logout
        </div>
      </nav>
    );
  }

  render() {
    const { view, isLoading, toast, showLocker, authorized } = this.props;

    if (!authorized) return <AuthView />;

    return (
      <div className={appContainerStyles}>
        <div className={navbarContainerStyles}>
          {this.renderNavbar()}
        </div>
        <div className={viewContainerStyles}>
          {!isLoading && view}
        </div>
        <div className={toastContainerStyles}>
          {toast}
        </div>
        {showLocker && <ProgressLocker />}
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
  showLocker: router.isLoading || chrome.showLocker,
  authorized: chrome.authorized,
});

const mapDispatchToProps = {
  showToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
