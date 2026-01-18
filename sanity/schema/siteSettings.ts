export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Site title' },
    { name: 'enablePhotography', type: 'boolean', title: 'Enable Photography section', initialValue: true },
    { name: 'enableBlog', type: 'boolean', title: 'Enable Blog section', initialValue: true },
    { name: 'enableTech', type: 'boolean', title: 'Enable Tech section', initialValue: true },
    { name: 'enableMusic', type: 'boolean', title: 'Enable Music section', initialValue: true }
  ]
}
