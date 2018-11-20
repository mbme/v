/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import IsodbReplica from '../isodb/replica';
import ReplicaInMemStorage from '../isodb/replica-in-mem-storage';
import LockManager from './lock-manager';
import SyncManager from './sync-manager';

const IsodbContext = React.createContext(null);

export default class IsodbClient extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);

    const storage = new ReplicaInMemStorage();
    const db = new IsodbReplica(storage);
    const lockManager = new LockManager();

    this.syncManager = new SyncManager(db, lockManager);

    this._context = {
      storage,
      db,
      lockManager,
    };
  }

  componentDidMount() {
    this.syncManager.start();
  }

  componentWillUnmount() {
    this.syncManager.stop();
  }

  render() {
    return (
      <IsodbContext.Provider value={this._context}>
        {this.props.children}
      </IsodbContext.Provider>
    );
  }
}


export function withIsodb(mapIsodbToProps, Component) {
  return class IsodbInjector extends PureComponent {
    static contextType = IsodbContext;

    constructor(props, context) {
      super(props, context);
      this.state = mapIsodbToProps(context.db, props);
    }

    componentDidMount() {
      // FIXME await this.context.lockManager.lockRecord()
      this.context.storage.events.on('update', this.onUpdate);
    }

    componentWillUnmount() {
      this.context.storage.events.off('update', this.onUpdate);
    }

    onUpdate = () => {
      this.setState(mapIsodbToProps(this.context.db, this.props));
    };

    render() {
      return (
        <Component {...this.props} {...this.state} />
      );
    }
  };
}
