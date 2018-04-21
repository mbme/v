import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { push } from 'client/history';
import s from 'client/styles';

const linkStyles = clean => s.cx({
  cursor: 'pointer',
  display: 'inline-block',
  extend: [
    !clean && {
      color: 'var(--color-link)',
    },
  ],
});

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
      <div className={s.cx(className, linkStyles(clean))} role="link" tabIndex="0" onClick={this.onClick}>
        {children}
      </div>
    );
  }
}
