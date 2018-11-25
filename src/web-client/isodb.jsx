import React, { PureComponent } from 'react';

export const IsodbContext = React.createContext();

export function withIsodb(mapIsodbToProps, Component) {
  return class IsodbInjector extends PureComponent {
    static contextType = IsodbContext;

    constructor(props, context) {
      super(props, context);
      this.state = mapIsodbToProps(context, props);
    }

    componentDidMount() {
      // FIXME await this.context.lockRecord()
      this.context.events.on('update', this.onUpdate);
    }

    componentWillUnmount() {
      this.context.events.off('update', this.onUpdate);
    }

    onUpdate = () => {
      this.setState(mapIsodbToProps(this.context, this.props));
    };

    render() {
      return (
        <Component {...this.props} {...this.state} />
      );
    }
  };
}
