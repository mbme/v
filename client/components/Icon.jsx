import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils';

// https://feathericons.com/
function FeatherIcon({ children, ...otherProps }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="transparent"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      {children}
    </svg>
  );
}
FeatherIcon.propTypes = {
  children: PropTypes.node.isRequired,
};

const icons = {
  'log-out': (
    <FeatherIcon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </FeatherIcon>
  ),

  'loader': (
    <FeatherIcon>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </FeatherIcon>
  ),

  'eye-off': (
    <FeatherIcon>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </FeatherIcon>
  ),

  'eye': (
    <FeatherIcon>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </FeatherIcon>
  ),

  'paperclip': (
    <FeatherIcon>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </FeatherIcon>
  ),

  'trash-2': (
    <FeatherIcon>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </FeatherIcon>
  ),

  'edit': (
    <FeatherIcon>
      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
    </FeatherIcon>
  ),

  'edit-2': (
    <FeatherIcon>
      <polygon points="16 3 21 8 8 21 3 21 3 16 16 3" />
    </FeatherIcon>
  ),

  'menu': (
    <FeatherIcon>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </FeatherIcon>
  ),

  'search': (
    <FeatherIcon>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </FeatherIcon>
  ),

  'x': (
    <FeatherIcon>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </FeatherIcon>
  ),
};

export const ICON_TYPES = Object.keys(icons);

export default function Icon({ type, className, ...otherProps }) {
  return React.cloneElement(icons[type], {
    className: classNames('Icon', className),
    'aria-label': type,
    ...otherProps,
  });
}

Icon.propTypes = {
  type: PropTypes.oneOf(Object.keys(icons)).isRequired,
  className: PropTypes.string,
};
