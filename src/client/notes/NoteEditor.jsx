import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  createLink,
  createImageLink,
  extractFileIds,
  parse,
} from '../../v-parser';
import { api } from '../utils';
import {
  Button,
  Textarea,
  Toolbar,
  Input,
  Icon,
} from '../components';
import { Consumer } from '../chrome/Router';
import Note from './Note';
import AttachFileButton from './AttachFileButton';
import DeleteNoteButton from './DeleteNoteButton';

const isImage = name => [ '.png', '.jpg', '.jpeg' ].reduce((acc, ext) => acc || name.endsWith(ext), false);

export default class NoteEditor extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
  };

  state = {
    preview: false,
    name: this.props.name,
    data: this.props.data,
  };

  localFiles = {};

  textAreaRef = null;
  router = null;

  hasChanges = () => this.state.name !== this.props.name || this.state.data !== this.props.data;
  onNameChange = name => this.setState({ name });
  onDataChange = data => this.setState({ data });

  closeEditor = id => this.router.push(id ? { name: 'note', params: { id } } : { name: 'notes' });

  togglePreview = () => this.setState(state => ({ preview: !state.preview }));

  onSave = async () => {
    await api.UPDATE_NOTE({ id: this.props.id, name: this.state.name, data: this.state.data }, this.getAssets());
    this.closeEditor(this.props.id);
  };

  onCreate = async () => {
    const note = await api.CREATE_NOTE({ name: this.state.name, data: this.state.data }, this.getAssets());
    this.closeEditor(note.id);
  };

  getAssets() {
    const ids = extractFileIds(parse(this.state.data));
    // TODO filter out known files
    return Object.entries(this.localFiles).filter(([ id ]) => ids.includes(id)).map(([ , file ]) => file.file);
  }

  onFilesSelected = async (files) => {
    const links = [];

    Object.entries(files).forEach(([ hash, { file, data } ]) => {
      links.push((isImage(file.name) ? createImageLink : createLink)(file.name, hash));

      if (!this.localFiles[hash]) {
        this.localFiles = {
          ...this.localFiles,
          [hash]: { file, data },
        };
      }
    });

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
        <Consumer>
          {(router) => {
            this.router = router;
          }}
        </Consumer>

        <Toolbar left={leftIcons} right={rightIcons} />

        <div className="g-section" hidden={preview}>
          <Input className="Note-title" name="name" value={name} onChange={this.onNameChange} autoFocus />
        </div>

        <div className="g-section" hidden={preview}>
          <Textarea name="data" value={data} onChange={this.onDataChange} ref={(ref) => { this.textAreaRef = ref; }} />
        </div>

        {preview && <Note name={name} data={data} localFiles={this.localFiles} />}
      </Fragment>
    );
  }
}
