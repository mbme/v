export const SHOW_TOAST = 'CHROME_SHOW_TOAST';
export const showToast = data => ({ type: SHOW_TOAST, data });

export const SHOW_LOCKER = 'CHROME_SHOW_LOCKER';
export const showLocker = show => ({ type: SHOW_LOCKER, show });

export const SET_AUTHORIZED = 'CHROME_SET_AUTHORIZED';
export const setAuthorized = authorized => ({ type: SET_AUTHORIZED, authorized });

export const ping = () => (dispatch, getState, apiClient) => apiClient.ping();

export const SHOW_NAV = 'CHROME_SHOW_NAV';
export const showNav = show => ({ type: SHOW_NAV, show });
