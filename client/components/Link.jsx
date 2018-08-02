import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { push } from '../router';
import { classNames } from '../utils';

export default class Link extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      params: PropTypes.object,
      query: PropTypes.object,
    }).isRequired,
    children: PropTypes.node.isRequired,
    clean: PropTypes.bool,
  };

  onClick = () => push(this.props.to);

  render() {
    const { className, children, clean } = this.props;

    return (
      <div
        className={classNames('Link', { 'is-clean': clean }, className)}
        role="link"
        tabIndex="0"
        onClick={this.onClick}
      >
        {children}
      </div>
    );
  }
}
