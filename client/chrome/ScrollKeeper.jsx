import { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Switch off the native scroll restoration behavior and handle it manually
// https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

// save & restore scroll pos
export default class ScrollKeeper extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      isPush: PropTypes.bool.isRequired,
    }).isRequired,
    children: PropTypes.node,
  };

  scrollPos = {};
  rootEl = document.getElementById('root');

  getSnapshotBeforeUpdate(prevProps) {
    this.scrollPos[prevProps.pathname] = {
      offsetX: this.rootEl.scrollLeft,
      offsetY: this.rootEl.scrollTop,
    };
  }

  componentDidUpdate() {
    const { isPush, pathname } = this.props.location;

    if (isPush) {
      delete this.scrollPos[pathname]; // delete stored scroll position for the next page
      this.rootEl.scrollLeft = 0;
      this.rootEl.scrollTop = 0;
    } else {
      // try to restore scroll position
      const { offsetX, offsetY } = this.scrollPos[pathname] || { offsetX: 0, offsetY: 0 };
      this.rootEl.scrollLeft = offsetX;
      this.rootEl.scrollTop = offsetY;
    }
  }

  render() {
    return this.props.children;
  }
}
