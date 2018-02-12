import React from 'react';
import PropTypes from 'prop-types';
import feather from 'feather-icons';

export default function Icon({ type, className }) {
  const svg = feather.icons[type].toSvg({ fill: 'transparent' });

  return (
    <div className={className} aria-label={type} dangerouslySetInnerHTML={{ __html: svg }} /> // eslint-disable-line react/no-danger
  );
}

Icon.propTypes = {
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
};
