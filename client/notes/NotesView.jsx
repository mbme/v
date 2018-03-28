import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatTs } from 'shared/utils';
import { noteShape } from 'client/shapes';
import s from 'client/styles';
import { Button, Toolbar, Link, Filter } from 'client/components';
import * as notesActions from './actions';

const linkStyles = s.cx(s.section, s.flex({ v: 'baseline' }));

const counterStyles = s.cx({
  marginLeft: 'var(--spacing-small)',
  whiteSpace: 'nowrap',
});

const timeStyles = s.cx({
  marginRight: 'var(--spacing-small)',
});

class NotesView extends PureComponent {
  static propTypes = {
    notes: PropTypes.arrayOf(noteShape).isRequired,
    filter: PropTypes.string.isRequired,
    listNotes: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.props.listNotes(props.filter);
  }

  componentWillUpdate(nextProps) {
    if (this.props.filter !== nextProps.filter) {
      nextProps.listNotes(nextProps.filter);
    }
  }

  render() {
    const notes = this.props.notes.map(note => (
      <Link key={note.id} clean to={{ name: 'note', params: { id: note.id } }} className={linkStyles}>
        <small className={timeStyles}>{formatTs(note.updatedTs)}</small>
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

        <small className={counterStyles}>
          {notes.length} items
        </small>

        {notes}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ notes, router }) => ({
  notes: notes.notes,
  filter: router.query.filter || '',
});

const mapDispatchToProps = {
  listNotes: notesActions.listNotes,
};

export default connect(mapStateToProps, mapDispatchToProps)(NotesView);
