export const CHANGE_LIST = 'TRACKS/CHANGE_LIST';
export function listTracks(filter = '') {
  return async (dispatch, getState, apiClient) => {
    const result = await apiClient.listTracks({ size: 0, filter });

    dispatch({ type: CHANGE_LIST, tracks: result.items });
  };
}
