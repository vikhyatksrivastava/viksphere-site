import React from 'react'
import { render, screen } from '@testing-library/react'
import PhotoGallery from '../app/components/PhotoGallery'

describe('PhotoGallery', () => {
  test('renders default photos when none provided', () => {
    render(<PhotoGallery />)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThanOrEqual(3)
    expect(screen.getByAltText('Landscape 01')).toBeInTheDocument()
  })

  test('renders provided photos', () => {
    const photos = [
      { src: 'https://example.com/img1.jpg', alt: 'Img1' },
      { src: '/images/custom.jpg', alt: 'Custom' },
    ]
    render(<PhotoGallery photos={photos} />)
    expect(screen.getByAltText('Img1')).toBeInTheDocument()
    expect(screen.getByAltText('Custom')).toBeInTheDocument()
  })
})
