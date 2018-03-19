import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fuzzySearch, recentComparator } from 'shared/utils';
import s from 'client/styles';
import { Toolbar, Filter } from 'client/components';

const counterStyles = s.cx({
  marginLeft: 'var(--spacing-small)',
  whiteSpace: 'nowrap',
});

function isTrackVisible(track, filter) {
  return fuzzySearch(filter, [ track.fields.name, track.fields.artist ].join(' '));
}

class TracksView extends PureComponent {
  static propTypes = {
    tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
  };

  getVisibleTracks() {
    return this.props.tracks
      .filter(track => isTrackVisible(track, this.props.filter))
      .sort(recentComparator);
  }

  render() {
    const tracks = this.getVisibleTracks().map(track => (
      <div key={track.id}>{track.fields.artist} - {track.fields.title}</div>
    ));

    const left = (
      <Fragment>
        <Filter placeholder="Filter tracks" />
        <small className={counterStyles}>
          {tracks.length} items
        </small>
      </Fragment>
    );

    return (
      <Fragment>
        <Toolbar left={left} />
        {tracks}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ tracks, router }) => ({
  tracks: tracks.tracks,
  filter: router.query.filter || '',
});

export default connect(mapStateToProps)(TracksView);
