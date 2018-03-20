export const CHANGE_LIST = 'NOTES/CHANGE_LIST';
export function listNotes(filter = '') {
  return async (dispatch, getState, apiClient) => {
    const result = await apiClient.listNotes({ size: 0, filter });

    dispatch({ type: CHANGE_LIST, notes: result.items });
  };
}

export const SET = 'NOTES/SET';
export function readNote(id) {
  return async (dispatch, getState, apiClient) => {
    const result = await apiClient.readNote(id);

    dispatch({ type: SET, id, note: result });
  };
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
