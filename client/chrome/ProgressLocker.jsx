import React from 'react';
import s from 'client/styles';
import { Icon, Backdrop } from 'client/components';

const backdropStyles = s.cx({
  cursor: 'progress',
  animationName: s.animation({
    '0%': { opacity: '0.7' },
    '50%': { opacity: '1' },
    '100%': { opacity: '0.7' },
  }),
  animationDuration: '3s',
  animationIterationCount: 'infinite',
  alignItems: 'center',
});

const spinnerStyles = s.cx({
  width: '24px',
  height: '24px',
  animationName: s.animation({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(359deg)' },
  }),
  animationDuration: '1.5s',
  animationIterationCount: 'infinite',
});

export default function ProgressLocker() {
  return (
    <Backdrop className={backdropStyles}>
      <Icon type="loader" className={spinnerStyles} />
    </Backdrop>
  );
}
