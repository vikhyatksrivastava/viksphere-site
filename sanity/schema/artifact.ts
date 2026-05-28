export default {
  name: 'artifact',
  title: 'Artifact',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'description', type: 'text', title: 'Description' },
    { name: 'repoUrl', type: 'url', title: 'Repository URL' },
    { name: 'tags', type: 'array', of: [{ type: 'string' }] }
  ]
}
