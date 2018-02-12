const NOTE_TYPE = 'note';

export const LIST_OUTDATED = 'NOTES/LIST_OUTDATED';
export function markNotesListOutdated() {
  return {
    type: LIST_OUTDATED,
  };
}

export const LIST_CHANGE = 'NOTES/LIST_CHANGE';
export function listNotes() {
  return async (dispatch, getState, apiClient) => {
    const { notes } = getState();

    if (notes.fresh) {
      return null;
    }

    const records = await apiClient.listRecords(NOTE_TYPE);

    return dispatch({
      type: LIST_CHANGE,
      notes: records,
    });
  };
}

export function updateNote(id, name, data, newFiles) {
  return async (dispatch, getState, apiClient) => {
    await apiClient.updateRecord(id, name, data, newFiles);

    dispatch(markNotesListOutdated());
  };
}

export function deleteNote(id) {
  return async (dispatch, getState, apiClient) => {
    await apiClient.deleteRecord(id);

    dispatch(markNotesListOutdated());
  };
}

export function createNote(name, data, newFiles) {
  return async (dispatch, getState, apiClient) => {
    const record = await apiClient.createRecord(NOTE_TYPE, name, data, newFiles);

    dispatch(markNotesListOutdated());

    return record.id;
  };
}
