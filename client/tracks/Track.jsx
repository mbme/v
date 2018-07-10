import React, { PureComponent } from 'react';
import { trackShape } from '../utils/shapes';
import s from '../styles';

const styles = s.styles({
  track: {
    padding: 'var(--spacing-small)',
    borderBottom: 'var(--border)',
    cursor: 'pointer',
    fontSize: 'var(--font-size-small)',
    ':hover': {
      backgroundColor: 'var(--bg-color-darker)',
    },
    ':last-child': {
      borderBottom: '0 none',
    },
  },
  artist: {
    width: '30%',
    display: 'inline-block',
    fontWeight: '500',
  },
  title: {
    width: '60%',
    display: 'inline-block',
    color: 'var(--color-secondary)',
  },
  meta: {
    display: 'inline-block',
    color: 'var(--color-secondary)',
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-fine)',
  },
});

const formatDuration = seconds => [ Math.floor(seconds / 60), Math.floor(seconds % 60) ].join(':');

export default class Track extends PureComponent {
  static propTypes = {
    track: trackShape.isRequired,
  };

  render() {
    const { track } = this.props;

    const file = track.files[0];

    return (
      <div className={styles.track}>
        <span className={styles.artist}>{track.fields.artist}</span>
        <span className={styles.title}>{track.fields.title}</span>
        <span className={styles.meta}>{formatDuration(file.meta.duration)}</span>
      </div>
    );
  }
}
