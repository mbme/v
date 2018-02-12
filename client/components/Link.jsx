import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import * as routerActions from 'client/router/actions';

class Link extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      params: PropTypes.object,
    }).isRequired,
    children: PropTypes.node.isRequired,
    push: PropTypes.func.isRequired,
  };

  onClick = () => this.props.push(this.props.to);

  render() {
    const { className, children } = this.props;

    return (
      <div className={s.cx(className, 'cursor-pointer')} role="link" tabIndex="0" onClick={this.onClick}>
        {children}
      </div>
    );
  }
}

const mapDispatchToProps = {
  push: routerActions.push,
};

export default connect(null, mapDispatchToProps)(Link);
