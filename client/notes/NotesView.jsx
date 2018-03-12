import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as routerActions from 'client/router/actions';
import { fuzzySearch, recentComparator, formatTs } from 'shared/utils';
import s from 'client/styles';
import { Button, Toolbar, Link, Input } from 'client/components';

const linkStyles = s.cx(s.section, s.flex({ v: 'baseline' }));

const counterStyles = s.cx({
  marginLeft: 'var(--spacing-small)',
  whiteSpace: 'nowrap',
});

const timeStyles = s.cx({
  marginRight: 'var(--spacing-small)',
});

class NotesView extends PureComponent {
  static propTypes = {
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
  };

  getVisibleNotes() {
    return this.props.notes
      .filter(note => fuzzySearch(this.props.filter, note.fields.name.toLowerCase()))
      .sort(recentComparator);
  }

  updateTimoutId = null;
  onFilterChange = (filter) => {
    if (filter.trim() === this.props.filter) return;

    window.clearTimeout(this.updateTimoutId);
    this.updateTimoutId = window.setTimeout(this.props.setFilter, 60, filter);
  };

  componentWillUnmount() {
    window.clearTimeout(this.updateTimoutId);
  }

  render() {
    const notes = this.getVisibleNotes().map(note => (
      <Link key={note.id} to={{ name: 'note', params: { id: note.id } }} className={linkStyles}>
        <small className={timeStyles}>{formatTs(note.updatedTs)}</small>
        {note.fields.name}
      </Link>
    ));

    const left = (
      <Fragment>
        <Input
          name="filter"
          defaultValue={this.props.filter}
          placeholder="Filter notes"
          onChange={this.onFilterChange}
          autoFocus
        />
        <small className={counterStyles}>
          {notes.length} items
        </small>
      </Fragment>
    );

    const addBtn = (
      <Link to={{ name: 'add-note' }}>
        <Button raised primary>Add</Button>
      </Link>
    );

    return (
      <Fragment>
        <Toolbar left={left} right={addBtn} />
        {notes}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ notes, router }) => ({
  notes: notes.notes,
  filter: router.query.filter || '',
});

const mapDispatchToProps = dispatch => ({
  setFilter(filter) {
    const params = filter.trim().length ? { filter } : null;
    dispatch(routerActions.replace({ name: 'notes', params }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NotesView);
