import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import s from 'client/styles';
import { Toolbar, Filter } from 'client/components';
import Track from './Track';

const styles = s.styles({
  counter: {
    marginLeft: 'var(--spacing-small)',
    whiteSpace: 'nowrap',
  },
});

class TracksView extends PureComponent {
  static propTypes = {
    filter: PropTypes.string.isRequired,
  };

  state = {
    tracks: [],
  };

  constructor(props) {
    super(props);
    this.loadData();
  }

  async loadData() {
    const result = await apiClient.listTracks({ size: 0, filter: this.props.filter });
    this.setState({ tracks: result.items });
  }

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) this.loadData();
  }

  render() {
    const tracks = this.state.tracks.map(track => <Track key={track.id} track={track} />);

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

const mapStateToProps = ({ router }) => ({
  filter: router.query.filter || '',
});

export default connect(mapStateToProps)(TracksView);
