import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { partial } from 'lodash';
import {
  loadEntries as actionLoadEntries,
  traverseCollectionCursor as actionTraverseCollectionCursor,
} from 'Actions/entries';
import { selectEntries } from 'Reducers';
import { selectCollectionEntriesCursor } from 'Reducers/cursors';
import Cursor from 'ValueObjects/Cursor';
import Entries from './Entries';

class EntriesCollection extends React.Component {
  static propTypes = {
    collection: ImmutablePropTypes.map.isRequired,
    publicFolder: PropTypes.string.isRequired,
    entries: ImmutablePropTypes.list,
    isFetching: PropTypes.bool.isRequired,
    viewStyle: PropTypes.string,
    cursor: PropTypes.object.isRequired,
    loadEntries: PropTypes.func.isRequired,
    traverseCollectionCursor: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { collection, loadEntries } = this.props;
    if (collection) {
      loadEntries(collection);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { collection, loadEntries } = this.props;
    if (nextProps.collection !== collection) {
      loadEntries(nextProps.collection);
    }
  }

  handleCursorActions = (cursor, action) => {
    const { collection, traverseCollectionCursor } = this.props;
    traverseCollectionCursor(collection, action);
  };

  render () {
    const { collection, entries, publicFolder, isFetching, viewStyle, cursor } = this.props;

    return (
      <Entries
        collections={collection}
        entries={entries}
        publicFolder={publicFolder}
        isFetching={isFetching}
        collectionName={collection.get('label')}
        viewStyle={viewStyle}
        cursor={cursor}
        handleCursorActions={partial(this.handleCursorActions, cursor)}
      />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { collection, viewStyle } = ownProps;
  const { config } = state;
  const publicFolder = config.get('public_folder');
  const page = state.entries.getIn(['pages', collection.get('name'), 'page']);

  const entries = selectEntries(state, collection.get('name'));
  const isFetching = state.entries.getIn(['pages', collection.get('name'), 'isFetching'], false);

  const rawCursor = selectCollectionEntriesCursor(state.cursors, collection.get("name"));
  const cursor = Cursor.create(rawCursor).clearData();

  return { publicFolder, collection, page, entries, isFetching, viewStyle, cursor };
}

const mapDispatchToProps = {
  loadEntries: actionLoadEntries,
  traverseCollectionCursor: actionTraverseCollectionCursor,
};

export default connect(mapStateToProps, mapDispatchToProps)(EntriesCollection);