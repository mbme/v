import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils';
import { Consumer, locationShape } from '../chrome/Router';

export default class Link extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    to: locationShape.isRequired,
    children: PropTypes.node.isRequired,
    clean: PropTypes.bool,
  };

  router = null;

  onClick = () => {
    this.router.push(this.props.to);
  };

  render() {
    const { className, children, clean } = this.props;

    return (
      <div
        className={classNames('Link', { 'is-clean': clean }, className)}
        role="link"
        tabIndex="0"
        onClick={this.onClick}
      >
        <Consumer>
          {(router) => {
            this.router = router;
          }}
        </Consumer>

        {children}
      </div>
    );
  }
}
