import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Link, IconButton } from 'client/components';
import { deauthorize } from 'client/utils/platform';
import { showToast } from './actions';
import AuthView from './AuthView';
import ProgressLocker from './ProgressLocker';

function NotFoundView() {
  return (
    <div className="view-container">
      <div className="heading">NOT FOUND</div>
    </div>
  );
}

const appContainer = s.cx({
  margin: '0 auto',
  maxWidth: 'var(--max-width)',
});

const toastContainer = s.cx({
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

const navLink = isSelected => s.cx({
  display: 'inline-block',
  margin: '0 var(--spacing-medium)',
  color: 'var(--color-link)',
  ...s.if(isSelected, {
    borderBottom: '2px solid var(--color-link)',
  }),
});

const logoutIcon = s.cx({
  position: 'absolute',
  right: '0',
  top: '-5px',
});

class App extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    routingSequence: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    const route = this.props.routingSequence[0];

    return (
      <nav className="section relative">
        <Link to={{ name: 'notes' }} className={navLink(route === 'notes')}>Notes</Link>
        <Link to={{ name: 'todos' }} className={navLink(route === 'todos')}>Todos</Link>
        <Link to={{ name: 'one' }} className={navLink(route === 'one')}>One</Link>
        <IconButton className={logoutIcon} type="log-out" title="Logout" onClick={this.logout} />
      </nav>
    );
  }

  render() {
    const { view, isLoading, toast, showLocker, authorized } = this.props;

    if (!authorized) return <AuthView />;

    const currentView = isLoading ? null : (view || <NotFoundView />);

    return (
      <div className={appContainer}>
        {this.renderNavbar()}
        {currentView}
        <div className={toastContainer}>
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
  routingSequence: router.routingSequence,
  toast: chrome.toast,
  showLocker: router.isLoading || chrome.showLocker,
  authorized: chrome.authorized,
});

const mapDispatchToProps = {
  showToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
