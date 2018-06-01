import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';
import { inject } from 'client/store';
import { apiClient } from 'client/utils/platform';
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

  async loadData() {
    const result = await apiClient.LIST_TRACKS({ size: 0, filter: this.props.filter });
    this.setState({ tracks: result.items });
  }

  componentDidMount() {
    this.loadData();
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

const mapStoreToProps = state => ({
  filter: state.query.filter || '',
});

export default inject(mapStoreToProps, TracksView);
