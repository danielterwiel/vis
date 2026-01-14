import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VisualizationPanel from './VisualizationPanel'

describe('VisualizationPanel', () => {
  it('renders the visualization panel', () => {
    render(<VisualizationPanel />)
    expect(screen.getByText('Visualization')).toBeDefined()
  })

  it('renders placeholder text', () => {
    render(<VisualizationPanel />)
    expect(screen.getByText('D3 visualizations will go here')).toBeDefined()
  })
})
