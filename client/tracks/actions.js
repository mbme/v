export const CHANGE_LIST = 'TRACKS/CHANGE_LIST';
export function listTracks() {
  return async (dispatch, getState, apiClient) => dispatch({
    type: CHANGE_LIST,
    tracks: await apiClient.listTracks(),
  });
}
