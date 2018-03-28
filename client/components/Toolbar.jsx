import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Icon } from 'client/components';
import * as chromeActions from 'client/chrome/actions';

const styles = s.styles({
  container: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--bg-color)',
    padding: 'var(--spacing-fine) 0',

    extend: [
      s.section,
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
    const { left, right } = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.cell}>
          <Icon type="menu" className={styles.menuIcon} onClick={this.toggleNav} />
          {left}
        </div>
        <div className={styles.cell}>{right}</div>
      </div>
    );
  }
}

const mapStateToProps = ({ chrome }) => ({
  isNavVisible: chrome.showNav,
});

const mapDispatchToProps = {
  showNav: chromeActions.showNav,
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
