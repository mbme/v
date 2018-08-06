import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { inject } from '../store';
import { readFile, sha256 } from '../utils';
import { Icon } from '../components';

class AttachFileButton extends PureComponent {
  static propTypes = {
    onSelected: PropTypes.func.isRequired,
    showLocker: PropTypes.func.isRequired,
  };

  formRef = null;

  onClick = () => this.formRef.firstElementChild.click();

  onFilesSelected = async (e) => {
    const filesArr = [ ...e.target.files ]; // FileList -> Array

    if (filesArr.length) {
      this.props.showLocker(true);

      const files = {};
      await Promise.all(filesArr.map(async (file) => {
        const data = await readFile(file);
        const hash = await sha256(data);
        files[hash] = {
          file,
          data,
        };
      }));
      this.props.onSelected(files);

      this.props.showLocker(false);
    }

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

const mapStoreToProps = (state, actions) => ({
  showLocker: actions.showLocker,
});

export default inject(mapStoreToProps, AttachFileButton);
