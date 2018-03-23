import React, { PureComponent } from 'react';
import { trackShape } from 'client/shapes';
import s from 'client/styles';

const trackStyles = s.cx({
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
});

const artistStyles = s.cx({
  width: '30%',
  display: 'inline-block',
  fontWeight: '500',
});

const titleStyles = s.cx({
  width: '60%',
  display: 'inline-block',
  color: 'var(--color-secondary)',
});

const metaStyles = s.cx({
  display: 'inline-block',
  color: 'var(--color-secondary)',
  fontFamily: 'var(--font-family-mono)',
  fontSize: 'var(--font-size-fine)',
});

const formatDuration = seconds => [ Math.floor(seconds / 60), Math.floor(seconds % 60 ) ].join(':');

export default class Track extends PureComponent {
  static propTypes = {
    track: trackShape.isRequired,
  };

  render() {
    const { track } = this.props;

    const file = track.files[0];

    return (
      <div className={trackStyles}>
        <span className={artistStyles}>{track.fields.artist}</span>
        <span className={titleStyles}>{track.fields.title}</span>
        <span className={metaStyles}>{formatDuration(file.meta.duration)}</span>
      </div>
    );
  }
}
