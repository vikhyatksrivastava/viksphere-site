import React from 'react'
import { render, screen } from '@testing-library/react'
import Hero from '../app/components/Hero'

jest.mock('../lib/image', () => ({ resolveImage: (s: any) => s, isExternalImage: (s: any) => false }))

describe('Hero', () => {
  test('renders heading and buttons', () => {
    render(<Hero />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('VikSphere')).toBeInTheDocument()
    expect(screen.getByText('Read my blog')).toBeInTheDocument()
    expect(screen.getByText('View photos')).toBeInTheDocument()
  })

  test('shows author line', () => {
    render(<Hero />)
    expect(screen.getByText('— Vikhyat')).toBeInTheDocument()
  })
})
