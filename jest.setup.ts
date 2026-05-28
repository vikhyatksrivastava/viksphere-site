import '@testing-library/jest-dom'
import React from 'react'

// Mock next/image to render a normal img for tests
jest.mock('next/image', () => ({
	__esModule: true,
	default: (props: any) => {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return React.createElement('img', props)
	},
}))
