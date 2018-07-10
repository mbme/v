import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../components';

export default class AttachFileButton extends PureComponent {
  static propTypes = {
    onSelected: PropTypes.func.isRequired,
  };

  formRef = null;

  onClick = () => this.formRef.firstElementChild.click();

  onFilesSelected = (e) => {
    this.props.onSelected([ ...e.target.files ]); // FileList -> Array

    this.formRef.reset();
  };

  render() {
    return (
      <Fragment>
        <Icon title="Attach files" type="paperclip" onClick={this.onClick} />

        <form hidden ref={(ref) => { this.formRef = ref; }}>
          <input type="file" multiple onChange={this.onFilesSelected} />
        </form>
      </Fragment>
    );
  }
}
