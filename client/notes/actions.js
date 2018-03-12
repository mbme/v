export const CHANGE_LIST = 'NOTES/CHANGE_LIST';
export function listNotes() {
  return async (dispatch, getState, apiClient) => dispatch({
    type: CHANGE_LIST,
    notes: await apiClient.listNotes(),
  });
}

export function updateNote(id, name, data, newFiles) {
  return async (dispatch, getState, apiClient) => {
    await apiClient.updateNote(id, name, data, newFiles);
  };
}

export function deleteNote(id) {
  return async (dispatch, getState, apiClient) => {
    await apiClient.deleteNote(id);
  };
}

export function createNote(name, data, newFiles) {
  return async (dispatch, getState, apiClient) => {
    const note = await apiClient.createNote(name, data, newFiles);

    return note.id;
  };
}
