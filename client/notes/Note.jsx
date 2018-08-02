import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { parse } from '../../shared/parser';
import { getFileUrl } from '../utils';

export default class Note extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    localFiles: PropTypes.object,
  };

  static defaultProps = {
    localFiles: {},
  };

  fileUrls = {};

  componentDidUpdate(prevProps) {
    if (this.props.localFiles !== prevProps.localFiles) throw new Error('update not supported');
  }

  componentWillUnmount() {
    for (const url of Object.values(this.fileUrls)) URL.revokeObjectURL(url);
  }

  getFileUrl(fileId) {
    const { localFiles } = this.props;

    if (!localFiles[fileId]) return getFileUrl(fileId);

    if (!this.fileUrls[fileId]) {
      this.fileUrls[fileId] = URL.createObjectURL(localFiles[fileId].file);
    }

    return this.fileUrls[fileId];
  }

  renderItem = (item) => {
    switch (item.type) {
      case 'Document': {
        return React.createElement('article', { className: 'Note-document' }, ...item.items.map(this.renderItem));
      }

      case 'Paragraph': {
        return React.createElement('p', {}, ...item.items.map(this.renderItem));
      }

      case 'Header':
        return (
          <h1>{item.text}</h1>
        );

      case 'Mono':
        return (
          <code>{item.text}</code>
        );

      case 'Bold':
        return (
          <strong>{item.text}</strong>
        );

      case 'Link': {
        const url = item.link.isInternal ? this.getFileUrl(item.link.address) : item.link.address;

        if (item.link.type === 'image') {
          return (
            <img className="Note-image" alt={item.link.name} src={url} />
          );
        }

        return (
          <a href={url}>{item.link.name}</a>
        );
      }

      default:
        return item;
    }
  };

  render() {
    return (
      <div>
        <h1 className="Note-title">{this.props.name}</h1>
        {this.renderItem(parse(this.props.data))}
      </div>
    );
  }
}
