import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as routerActions from 'client/router/actions';
import { Input, Icon } from 'client/components';

class Filter extends PureComponent {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,

    filter: PropTypes.string.isRequired,
    replaceQueryParam: PropTypes.func.isRequired,
  };

  state = {
    expanded: false,
  };

  updateTimoutId = null;

  expand = () => this.setState({ expanded: true });

  collapse = () => this.setState({ expanded: false });

  onBlur = () => {
    if (!this.props.filter.trim()) this.collapse();
  };

  onFilterChange = (filter) => {
    if (filter.trim() === this.props.filter) return;

    window.clearTimeout(this.updateTimoutId);
    this.updateTimoutId = window.setTimeout(
      this.props.replaceQueryParam,
      60,
      'filter',
      filter.trim().length ? filter : undefined,
    );
  };

  componentWillUnmount() {
    window.clearTimeout(this.updateTimoutId);
  }

  render() {
    if (this.state.expanded) {
      return (
        <Input
          name="filter"
          light
          defaultValue={this.props.filter}
          placeholder={this.props.placeholder}
          onChange={this.onFilterChange}
          onClear={this.collapse}
          onBlur={this.onBlur}
          autoFocus
        />
      );
    }

    return (
      <Icon type="search" onClick={this.expand} />
    );
  }
}

const mapStateToProps = ({ router }) => ({
  filter: router.query.filter || '',
});

const mapDispatchToProps = {
  replaceQueryParam: routerActions.replaceQueryParam,
};

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
