"use client"
import React from 'react'
import LightboxGallery from './LightboxGallery'

type Props = { images: string[] }

export default function LightboxWrapper(props: Props) {
  // Simple client wrapper that directly renders the client `LightboxGallery`.
  // This lets the server page statically import `LightboxWrapper` without
  // using `next/dynamic` with `ssr: false`.
  return <LightboxGallery {...props} />
}
