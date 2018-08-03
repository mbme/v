import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { api } from '../utils';
import { Icon, ConfirmationDialog } from '../components';
import { Consumer } from '../chrome/Router';

export default class DeleteNoteButton extends PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
  };

  state = {
    showConfirmation: false,
  };

  router = null;

  deleteNote = async () => {
    await api.DELETE_NOTE({ id: this.props.id });
    this.router.push({ name: 'notes' });
  };

  render() {
    return (
      <Fragment>
        <Consumer>
          {(router) => {
            this.router = router;
          }}
        </Consumer>

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
