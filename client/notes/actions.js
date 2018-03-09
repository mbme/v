export const LIST_OUTDATED = 'NOTES/LIST_OUTDATED';
export function markNotesListOutdated() {
  return {
    type: LIST_OUTDATED,
  };
}

export const LIST_CHANGE = 'NOTES/LIST_CHANGE';
export function listNotes() {
  return async (dispatch, getState, apiClient) => {
    if (getState().notes.fresh) {
      return null;
    }

    const newNotes = await apiClient.listNotes();

    return dispatch({ type: LIST_CHANGE, notes: newNotes });
  };
}

export function updateNote(id, name, data, newFiles) {
  return async (dispatch, getState, apiClient) => {
    await apiClient.updateNote(id, name, data, newFiles);

    dispatch(markNotesListOutdated());
  };
}

export function deleteNote(id) {
  return async (dispatch, getState, apiClient) => {
    await apiClient.deleteNote(id);

    dispatch(markNotesListOutdated());
  };
}

export function createNote(name, data, newFiles) {
  return async (dispatch, getState, apiClient) => {
    const note = await apiClient.createNote(name, data, newFiles);

    dispatch(markNotesListOutdated());

    return note.id;
  };
}
