import React from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';

const containerStyles = s.cx({
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--bg-color)',
  padding: 'var(--spacing-fine) 0',
}, s.section, s.flex({ h: 'space-between', v: 'center', wrap: false }));

const cellStyles = s.cx(s.flex({ h: 'center', v: 'center' }));

export default function Toolbar({ left, right }) {
  return (
    <div className={containerStyles}>
      <div className={cellStyles}>{left}</div>
      <div className={cellStyles}>{right}</div>
    </div>
  );
}

Toolbar.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
};
