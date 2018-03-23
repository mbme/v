import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createLink, createImageLink, extractFileIds, parse } from 'shared/parser';
import { readFile, sha256 } from 'client/utils';
import s from 'client/styles';
import { Button, Textarea, Toolbar, Input, Icon } from 'client/components';
import * as routerActions from 'client/router/actions';
import * as chromeActions from 'client/chrome/actions';
import * as notesActions from './actions';
import Note, { titleStyles } from './Note';
import AttachFileButton from './AttachFileButton';
import DeleteNoteButton from './DeleteNoteButton';

const isImage = name => [ '.png', '.jpg', '.jpeg' ].reduce((acc, ext) => acc || name.endsWith(ext), false);

class NoteEditor extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    push: PropTypes.func.isRequired,
    createNote: PropTypes.func.isRequired,
    updateNote: PropTypes.func.isRequired,
    showLocker: PropTypes.func.isRequired,
  };

  state = {
    preview: false,
    name: this.props.name,
    data: this.props.data,
  };

  localFiles = {};

  textAreaRef = null;

  hasChanges = () => this.state.name !== this.props.name || this.state.data !== this.props.data;
  onNameChange = name => this.setState({ name });
  onDataChange = data => this.setState({ data });

  closeEditor = id => this.props.push(id ? { name: 'note', params: { id } } : { name: 'notes' });

  togglePreview = () => this.setState({ preview: !this.state.preview });

  onSave = async () => {
    await this.props.updateNote(this.props.id, this.state.name, this.state.data, this.getAttachments());
    this.closeEditor(this.props.id);
  };

  onCreate = async () => {
    const id = await this.props.createNote(this.state.name, this.state.data, this.getAttachments());
    this.closeEditor(id);
  };

  getAttachments() {
    const ids = extractFileIds(parse(this.state.data));
    // TODO filter out known files
    return Object.entries(this.localFiles).filter(([ id ]) => ids.includes(id)).map(([ , file ]) => file.data);
  }

  onFilesSelected = async (files) => {
    if (!files.length) return;

    this.props.showLocker(true);

    const links = [];
    await Promise.all(files.map(async (file) => {
      const data = await readFile(file);
      const hash = await sha256(data);

      links.push((isImage(file.name) ? createImageLink : createLink)(file.name, hash));

      if (!this.localFiles[hash]) {
        this.localFiles = {
          ...this.localFiles,
          [hash]: { data, file },
        };
      }
    }));

    this.props.showLocker(false);

    this.textAreaRef.insert(links.join(' '));
    this.textAreaRef.focus();
  };

  render() {
    const { preview, name, data } = this.state;
    const { id } = this.props;
    const isValid = name && this.hasChanges();

    const leftIcons = (
      <Fragment>
        {id && <DeleteNoteButton id={id} />}
        <AttachFileButton onSelected={this.onFilesSelected} />
        <Icon title="Preview" type={preview ? 'eye-off' : 'eye'} onClick={this.togglePreview} />
      </Fragment>
    );

    const rightIcons = (
      <Fragment>
        <Button onClick={() => this.closeEditor(id)}>Cancel</Button>
        {id && <Button primary onClick={this.onSave} disabled={!isValid}>Save</Button>}
        {!id && <Button primary onClick={this.onCreate} disabled={!isValid}>Create</Button>}
      </Fragment>
    );

    return (
      <Fragment>
        <Toolbar left={leftIcons} right={rightIcons} />

        <div className={s.cx(s.section)} hidden={preview}>
          <Input className={titleStyles} name="name" value={name} onChange={this.onNameChange} autoFocus />
        </div>

        <div className={s.cx(s.section)} hidden={preview}>
          <Textarea name="data" value={data} onChange={this.onDataChange} ref={(ref) => { this.textAreaRef = ref; }} />
        </div>

        {preview && <Note name={name} data={data} localFiles={this.localFiles} />}
      </Fragment>
    );
  }
}

const mapDispatchToProps = {
  updateNote: notesActions.updateNote,
  createNote: notesActions.createNote,
  showLocker: chromeActions.showLocker,
  push: routerActions.push,
};

export default connect(null, mapDispatchToProps)(NoteEditor);
