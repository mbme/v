import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as routerActions from 'client/router/actions';
import { fuzzySearch, recentComparator } from 'shared/utils';
import s from 'client/styles';
import { Toolbar, Input } from 'client/components';

const counterStyles = s.cx({
  marginLeft: 'var(--spacing-small)',
  whiteSpace: 'nowrap',
});

function isTrackVisible(track, filter) {
  return fuzzySearch(filter, [ track.fields.name, track.fields.artist ].join(' ').toLowerCase());
}

class TracksView extends PureComponent {
  static propTypes = {
    tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
  };

  getVisibleTracks() {
    return this.props.tracks
      .filter(track => isTrackVisible(track, this.props.filter))
      .sort(recentComparator);
  }

  updateTimoutId = null;
  onFilterChange = (filter) => {
    if (filter.trim() === this.props.filter) return;

    window.clearTimeout(this.updateTimoutId);
    this.updateTimoutId = window.setTimeout(this.props.setFilter, 60, filter);
  };

  componentWillUnmount() {
    window.clearTimeout(this.updateTimoutId);
  }

  render() {
    const tracks = this.getVisibleTracks().map(track => (
      <div key={track.id}>{track.fields.artist} - {track.fields.title}</div>
    ));

    const left = (
      <Fragment>
        <Input
          name="filter"
          defaultValue={this.props.filter}
          placeholder="Filter tracks"
          onChange={this.onFilterChange}
          autoFocus
        />
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

const mapDispatchToProps = dispatch => ({
  setFilter(filter) {
    const params = filter.trim().length ? { filter } : null;
    dispatch(routerActions.replace({ name: 'tracks', params }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TracksView);
