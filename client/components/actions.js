export const SHOW_MODAL = 'COMPONENTS/SHOW_MODAL'
export function showModal(modal) {
  return {
    type: SHOW_MODAL,
    modal,
  }
}

export const HIDE_MODAL = 'COMPONENTS/HIDE_MODAL'
export function hideModal(modal) {
  return {
    type: HIDE_MODAL,
    modal,
  }
}
