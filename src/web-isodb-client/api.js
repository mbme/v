/* eslint-env browser */

export async function fetchPatch(rev) {
  const response = await fetch(`/api/patch?rev=${rev}`);

  if (!response.ok) {
    throw new Error(`Server responded with code ${response.status}`);
  }

  return response.json();
}

/**
 * @param {Object<string, blob>} attachments
 */
export async function pushChanges(rev, records, attachments) {
  const data = new FormData();
  data.append('rev', rev);
  data.append('records', JSON.stringify(records));
  for (const [ hash, blob ] of Object.entries(attachments)) {
    data.append(hash, blob);
  }

  const response = await fetch('/api/changes', {
    method: 'post',
    credentials: 'include',
    body: data,
  });

  if (!response.ok) {
    throw new Error(`Server responded with code ${response.status}`);
  }

  return response.json();
}
