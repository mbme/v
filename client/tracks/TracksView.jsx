import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { trackShape } from 'client/shapes';
import { Toolbar, Filter } from 'client/components';
import * as trackActions from './actions';
import Track from './Track';

const styles = s.styles({
  counter: {
    marginLeft: 'var(--spacing-small)',
    whiteSpace: 'nowrap',
  },
});

class TracksView extends PureComponent {
  static propTypes = {
    tracks: PropTypes.arrayOf(trackShape).isRequired,
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
    const tracks = this.props.tracks.map(track => <Track key={track.id} track={track} />);

    const left = (
      <Filter placeholder="Filter tracks" />
    );

    return (
      <Fragment>
        <Toolbar left={left} />

        <small className={styles.counter}>
          {tracks.length} items
        </small>

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
