import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';
import { inject } from 'client/store';
import { Icon } from 'client/components';

const styles = s.styles({
  container: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--bg-color)',
    padding: 'var(--spacing-fine) 0',
    height: '60px',
    marginBottom: 'var(--spacing-medium)',

    extend: [
      s.flex({ h: 'space-between', v: 'center', wrap: false }),
    ],
  },

  cell: s.flex({ h: 'center', v: 'center' }),

  menuIcon: {
    marginRight: 'var(--spacing-medium)',

    largeScreen: {
      display: 'none',
    },
  },
});

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
      <div className={styles.container}>
        <div className={styles.cell}>
          <Icon type="menu" className={styles.menuIcon} onClick={this.toggleNav} />
          {this.props.left}
        </div>
        <div className={styles.cell}>
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
