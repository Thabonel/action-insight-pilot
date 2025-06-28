import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import CampaignForm from '../../CampaignForm'

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()
const mockSetNewCampaign = vi.fn()

const mockCampaign = {
  name: '',
  type: 'email',
  status: 'draft',
  description: ''
}

describe('CampaignForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(
      <CampaignForm 
        newCampaign={mockCampaign}
        setNewCampaign={mockSetNewCampaign}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        loading={false}
      />
    )
    expect(container).toBeTruthy()
  })

  it('displays form title', () => {
    const { getByText } = render(
      <CampaignForm 
        newCampaign={mockCampaign}
        setNewCampaign={mockSetNewCampaign}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        loading={false}
      />
    )
    expect(getByText('Create New Campaign')).toBeTruthy()
  })
})