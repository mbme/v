import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { inject } from '../store';
import { Icon } from './index';

class Toolbar extends PureComponent {
  static propTypes = {
    left: PropTypes.node,
    right: PropTypes.node,
    isNavVisible: PropTypes.bool.isRequired,
    showNav: PropTypes.func.isRequired,
  };

  toggleNav = () => this.props.showNav(!this.props.isNavVisible);

  render() {
    return (
      <div className="Toolbar">
        <div className="Toolbar-cell">
          <Icon type="menu" className="Toolbar-menu-icon" onClick={this.toggleNav} />
          {this.props.left}
        </div>
        <div className="Toolbar-cell">
          {this.props.right}
        </div>
      </div>
    );
  }
}

const mapStoreToProps = (state, actions) => ({
  isNavVisible: state.showNav,
  showNav: actions.showNav,
});

export default inject(mapStoreToProps, Toolbar);
