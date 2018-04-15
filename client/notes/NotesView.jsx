import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatTs } from 'shared/utils';
import s from 'client/styles';
import { Button, Toolbar, Link, Filter, Styled } from 'client/components';

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

  constructor(props) {
    super(props);
    this.loadData();
  }

  async loadData() {
    const result = await apiClient.listNotes({ size: 0, filter: this.props.filter });
    this.setState({ notes: result.items });
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

const mapStateToProps = ({ router }) => ({
  filter: router.query.filter || '',
});

export default connect(mapStateToProps)(NotesView);
