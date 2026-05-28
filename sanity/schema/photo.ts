export default {
  name: 'photo',
  title: 'Photo',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'image', type: 'image', title: 'Image' },
    { name: 'takenAt', type: 'datetime', title: 'Taken At' },
    { name: 'location', type: 'string', title: 'Location' },
    { name: 'description', type: 'text', title: 'Description' }
  ]
}
