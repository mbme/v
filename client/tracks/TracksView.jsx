import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Toolbar, Filter } from 'client/components';
import * as trackActions from './actions';

const counterStyles = s.cx({
  marginLeft: 'var(--spacing-small)',
  whiteSpace: 'nowrap',
});

class TracksView extends PureComponent {
  static propTypes = {
    tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    listTracks: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    props.listTracks(props.filter);
  }

  componentWillUpdate(nextProps) {
    if (this.props.filter !== nextProps.filter) {
      nextProps.listTracks(nextProps.filter);
    }
  }

  render() {
    const tracks = this.props.tracks.map(track => (
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

const mapDispatchToProps = {
  listTracks: trackActions.listTracks,
};

export default connect(mapStateToProps, mapDispatchToProps)(TracksView);
