import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { push } from '../router';
import { api } from '../utils';
import { Icon, ConfirmationDialog } from '../components';

export default class DeleteNoteButton extends PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
  };

  state = {
    showConfirmation: false,
  };

  deleteNote = async () => {
    await api.DELETE_NOTE({ id: this.props.id });
    push({ name: 'notes' });
  };

  render() {
    return (
      <Fragment>
        <Icon
          title="Delete note"
          type="trash-2"
          onClick={() => this.setState({ showConfirmation: true })}
        />

        {this.state.showConfirmation && (
          <ConfirmationDialog
            confirmation="Delete"
            onConfirmed={this.deleteNote}
            onCancel={() => this.setState({ showConfirmation: false })}
          >
            Are you sure you want to <b>delete this note?</b>
          </ConfirmationDialog>
        )
        }
      </Fragment>
    );
  }
}
