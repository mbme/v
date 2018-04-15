import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import NotFoundView from 'client/chrome/NotFoundView';
import NoteEditor from './NoteEditor';

export default class NoteEditorView extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
  };

  state = {
    note: undefined,
  };

  constructor(props) {
    super(props);

    this.loadData();
  }

  async loadData() {
    if (!this.props.id) return;

    const result = await apiClient.readNote(this.props.id);
    this.setState({ note: result });
  }

  render() {
    const { id } = this.props;
    const { note } = this.state;

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
