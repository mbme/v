import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from './index';

export default class Filter extends PureComponent {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
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

  onChange = (filter) => {
    if (filter.trim() === this.props.filter) return;

    window.clearTimeout(this.updateTimoutId);
    this.updateTimoutId = window.setTimeout(
      this.props.onChange,
      60,
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
          onChange={this.onChange}
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
