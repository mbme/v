export const LIST_CHANGE = 'NOTES/LIST_CHANGE'

export function listNotes(reload = false) {
  return async (dispatch, getState, client) => {
    const { notes } = getState()

    if (notes.initialized && !reload) {
      return null
    }

    const records = await client.listRecords('note')

    return dispatch({
      type: LIST_CHANGE,
      notes: records,
    })
  }
}

export function updateNote(id, name, data) {
  return async (dispatch, getState, client) => {
    await client.updateRecord(id, name, data)

    return dispatch(listNotes(true))
  }
}

export function deleteNote(id) {
  return async (dispatch, getState, client) => {
    await client.deleteRecord(id)

    return dispatch(listNotes(true))
  }
}
