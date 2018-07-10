import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { formatTs } from '../../shared/utils';
import { api } from '../utils';
import { inject } from '../store';
import s from '../styles';
import {
  Button,
  Toolbar,
  Link,
  Filter,
  Styled,
} from '../components';

const styles = s.styles({
  link: {
    marginBottom: 'var(--spacing-medium)',
    extend: [
      s.flex({ v: 'baseline' }),
    ],
  },
  counter: {
    marginLeft: 'var(--spacing-small)',
    whiteSpace: 'nowrap',
  },
});

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
      <Link key={note.id} clean to={{ name: 'note', params: { id: note.id } }} className={styles.link}>
        <Styled as="small" $marginRight="var(--spacing-small)">
          {formatTs(note.updatedTs)}
        </Styled>
        {note.fields.name}
      </Link>
    ));

    const left = (
      <Filter placeholder="Filter notes" />
    );

    const addBtn = (
      <Link to={{ name: 'add-note' }}>
        <Button primary>Add</Button>
      </Link>
    );

    return (
      <Fragment>
        <Toolbar left={left} right={addBtn} />

        <small className={styles.counter}>
          {notes.length} items
        </small>

        {notes}
      </Fragment>
    );
  }
}

const mapStoreToProps = state => ({
  filter: state.query.filter || '',
});

export default inject(mapStoreToProps, NotesView);
