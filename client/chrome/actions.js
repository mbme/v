export const SHOW_TOAST = 'CHROME_SHOW_TOAST'
export const showToast = data => ({ type: SHOW_TOAST, data })

export const SHOW_LOCKER = 'CHROME_SHOW_LOCKER'
export const showLocker = show => ({ type: SHOW_LOCKER, show })

export const SET_AUTHORIZED = 'CHROME_SET_AUTHORIZED'
export const setAuthorized = authorized => ({ type: SET_AUTHORIZED, authorized })
