import React from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';
import Icon from './Icon';

const cleanButton = (disabled, primary) => ({
  border: '0 none',
  borderRadius: '2px',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: 'inherit',
  padding: 'var(--spacing-fine) var(--spacing-medium)',

  ...s.if(disabled, {
    cursor: 'auto',
    filter: 'invert(80%)',
  }),

  ...s.if(primary && !disabled, {
    color: 'var(--color-primary)',
  }),
});

const flatButton = (disabled, primary) => ({
  ...cleanButton(disabled, primary),

  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  transition: 'background-color 100ms linear',

  ...s.if(!disabled, {
    ':hover': {
      boxShadow: 'var(--box-shadow)',
    },
  }),
});

const raisedButton = (disabled, primary) => s.cx(cleanButton(disabled, primary), 'with-border');

export function Button({ onClick, disabled, raised, primary, children }) {
  const className = s.cx(raised ? raisedButton(disabled, primary) : flatButton(disabled, primary));
  return (
    <button className={className} onClick={onClick} disabled={disabled}>{children}</button>
  );
}
Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  raised: PropTypes.bool,
  primary: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export function IconButton({ type, title, onClick, className }) {
  return (
    <button className={s.cx(flatButton(false), className)} title={title} onClick={onClick}>
      <Icon type={type} />
    </button>
  );
}
IconButton.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};
