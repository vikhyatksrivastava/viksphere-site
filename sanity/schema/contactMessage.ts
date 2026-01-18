export default {
  name: 'contactMessage',
  title: 'Contact Message',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'message', type: 'text' },
    { name: 'receivedAt', type: 'datetime' }
  ]
}
