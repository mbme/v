import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link, Toolbar, Icon } from '../components';
import { api } from '../utils';
import NotFoundView from '../chrome/NotFoundView';
import DeleteNoteButton from './DeleteNoteButton';
import Note from './Note';

export default class NoteView extends PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
  };

  state = {
    note: undefined,
  };

  async loadData() {
    const result = await api.READ_NOTE({ id: this.props.id });
    this.setState({ note: result });
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const { note } = this.state;

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