import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import s from '../styles';

export default class Styled extends PureComponent {
  static propTypes = {
    as: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    className: PropTypes.string,
  };

  getProps() {
    const {
      as,
      className,
      ...otherProps
    } = this.props;

    const result = {};
    const styleProps = {};

    for (const [ key, value ] of Object.entries(otherProps)) {
      if (key[0] === '$') {
        styleProps[key.substring(1)] = value;
      } else {
        result[key] = value;
      }
    }

    result.className = s.cx(styleProps, className);

    return result;
  }

  render() {
    const StyledElement = this.props.as || 'div';

    return (
      <StyledElement {...this.getProps()} />
    );
  }
}
