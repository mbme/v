import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Link, Icon } from 'client/components';
import { deauthorize } from 'client/utils/platform';
import { showToast } from './actions';
import AuthView from './AuthView';
import ProgressLocker from './ProgressLocker';

const appContainerStyles = s.cx({
  margin: '0 auto',
  maxWidth: 'var(--max-width)',
});

const viewContainerStyles = s.cx(s.flex({ column: true }));

const navbarStyles = s.cx({
  position: 'relative',
  backgroundColor: 'var(--color-secondary)',
  color: 'white',
  padding: 'var(--spacing-small) var(--spacing-small)',
}, s.section);

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

const navLinkStyles = isSelected => s.cx({
  display: 'inline-block',
  margin: '0 var(--spacing-medium)',
  extend: [
    {
      condition: isSelected,
      color: 'var(--color-primary)',
    },
  ],
});

const logoutIconStyles = s.cx({
  position: 'absolute',
  right: 'var(--spacing-small)',
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

        <Icon className={logoutIconStyles} type="log-out" title="Logout" onClick={this.logout} />
      </nav>
    );
  }

  render() {
    const { view, isLoading, toast, showLocker, authorized } = this.props;

    if (!authorized) return <AuthView />;

    return (
      <div className={appContainerStyles}>
        {this.renderNavbar()}
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
