import React from 'react';
import PropTypes from 'prop-types';

export default function Select({ options, onChange, ...other }) {
  const items = Object.entries(options).map(([ key, label ]) => <option key={key} value={key}>{label}</option>);

  return (
    <select
      onChange={e => onChange(e.target.value)}
      {...other}
    >
      {items}
    </select>
  );
}

Select.propTypes = {
  options: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
