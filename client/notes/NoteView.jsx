import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Toolbar, Icon } from 'client/components';
import { noteShape } from 'client/shapes';
import NotFoundView from 'client/chrome/NotFoundView';
import * as notesActions from './actions';
import DeleteNoteButton from './DeleteNoteButton';
import Note from './Note';

class NoteView extends PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    note: noteShape,
    readNote: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    props.readNote(props.id);
  }

  render() {
    const { note } = this.props;

    if (note === null) return <NotFoundView />;
    if (note === undefined) return null;

    const deleteBtn = (
      <DeleteNoteButton key="delete" id={note.id} />
    );

    const editBtn = (
      <Link to={{ name: 'note-editor', params: { id: note.id } }} clean>
        <Icon type="edit-2" />
      </Link>
    );

    return (
      <Fragment>
        <Toolbar left={deleteBtn} right={editBtn} />
        <Note name={note.fields.name} data={note.fields.data} />
      </Fragment>
    );
  }
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.note[id],
});

const mapDispatchToProps = {
  readNote: notesActions.readNote,
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteView);
