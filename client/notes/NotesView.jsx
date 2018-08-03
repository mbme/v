import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { formatTs } from '../../shared/utils';
import { api } from '../utils';
import { inject } from '../store';
import { Consumer } from '../chrome/Router';
import {
  Button,
  Toolbar,
  Link,
  Filter,
} from '../components';

class NotesView extends PureComponent {
  static propTypes = {
    filter: PropTypes.string.isRequired,
  };

  state = {
    notes: [],
  };

  async loadData() {
    const result = await api.LIST_NOTES({ size: 0, filter: this.props.filter });
    this.setState({ notes: result.items });
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) this.loadData();
  }

  render() {
    const notes = this.state.notes.map(note => (
      <Link key={note.id} clean to={{ name: 'note', params: { id: note.id } }} className="Notes-link">
        <small className="Notes-ts">
          {formatTs(note.updatedTs)}
        </small>
        {note.fields.name}
      </Link>
    ));

    const left = (
      <Consumer>{
          ({ replaceParam }) => (
            <Filter
              placeholder="Filter notes"
              filter={this.props.filter}
              onChange={newFilter => replaceParam('filter', newFilter)}
            />
          )}
      </Consumer>
    );

    const addBtn = (
      <Link to={{ name: 'note' }}>
        <Button primary>Add</Button>
      </Link>
    );

    return (
      <Fragment>
        <Toolbar left={left} right={addBtn} />

        <small className="Notes-counter">
          {notes.length} items
        </small>

        {notes}
      </Fragment>
    );
  }
}

const mapStoreToProps = ({ route }) => ({
  filter: route.params.filter || '',
});

export default inject(mapStoreToProps, NotesView);
