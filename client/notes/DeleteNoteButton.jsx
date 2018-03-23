import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, ConfirmationDialog } from 'client/components';
import * as routerActions from 'client/router/actions';
import * as notesActions from './actions';

class DeleteNoteButton extends PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    deleteNote: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  };

  state = {
    showConfirmation: false,
  };

  deleteNote = () => this.props.deleteNote(this.props.id).then(() => this.props.push({ name: 'notes' }));

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

const mapDispatchToProps = {
  deleteNote: notesActions.deleteNote,
  push: routerActions.push,
};

export default connect(null, mapDispatchToProps)(DeleteNoteButton);
