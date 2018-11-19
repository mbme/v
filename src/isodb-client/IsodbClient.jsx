/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const IsodbContext = React.createContext(null);

export function withIsodb(mapIsodbToProps, Component) {
  return class IsodbInjector extends PureComponent {
    static contextType = IsodbContext;

    componentDidMount() {
      this.context.events.on('update', this.onUpdate);
    }

    componentWillUnmount() {
      this.context.events.off('update', this.onUpdate);
    }

    onUpdate = () => {
      this.forceUpdate();
    };

    render() {
      const mappedProps = mapIsodbToProps(this.context, this.props);

      return (
        <Component {...this.props} {...mappedProps} />
      );
    }
  };
}

export default class IsodbClient extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return (
      <IsodbContext.Provider value={db}>
        {this.props.children}
      </IsodbContext.Provider>
    );
  }
}
