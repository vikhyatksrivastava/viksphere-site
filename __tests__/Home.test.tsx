import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'
import { activities } from '../data/activities'

jest.mock('../lib/image', () => ({ resolveImage: (s: any) => s, isExternalImage: (s: any) => /^https?:\/\//.test(s) }))

describe('Home', () => {
  test('renders Latest section', () => {
    render(<Home />)
    expect(screen.getByText('Latest')).toBeInTheDocument()
  })

  test('blog activities link to external URLs', () => {
    render(<Home />)
    const blogActivities = activities.filter((a) => a.kind === 'blog')
    for (const b of blogActivities) {
      if (b.url) {
        // anchor with href should be present
        const anchor = screen.getByRole('link', { name: new RegExp(b.title.split(' ')[0]) })
        expect(anchor).toBeInTheDocument()
        expect(anchor.getAttribute('href')).toBe(b.url)
      }
    }
  })
})
