
export default function initStore(client) {
  let initialized = false
  return {
    notes: [],

    async listNotes() {
      initialized = true
      this.notes = await client.listRecords('note')
    },

    async listNotesOnce() {
      if (!initialized) {
        await this.listNotes()
      }
    },
  }
}
