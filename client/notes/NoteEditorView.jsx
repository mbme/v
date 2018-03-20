import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NotFoundView from 'client/chrome/NotFoundView';
import * as notesActions from './actions';
import NoteEditor from './NoteEditor';

class NoteEditorView extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
    note: PropTypes.object,
    readNote: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    if (props.id) props.readNote(props.id);
  }

  render() {
    const { id, note } = this.props;

    if (note === null) return <NotFoundView />;

    if (id && note === undefined) return null; // loading...

    return (
      <NoteEditor
        id={id}
        name={note ? note.fields.name : ''}
        data={note ? note.fields.data : ''}
      />
    );
  }
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: id ? notes.note[id] : undefined,
});

const mapDispatchToProps = {
  readNote: notesActions.readNote,
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteEditorView);
