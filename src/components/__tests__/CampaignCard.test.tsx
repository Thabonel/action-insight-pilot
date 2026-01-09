import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CampaignCard from '../CampaignCard'

// Mock the campaign data
const mockCampaign = {
  id: '1',
  name: 'Test Campaign',
  description: 'Test campaign description',
  type: 'email' as const,
  channel: 'email' as const,
  status: 'active' as const,
  total_budget: 5000,
  budget_allocated: 3000,
  budget_spent: 1500,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'user-1'
}

describe('CampaignCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <CampaignCard campaign={mockCampaign} />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('displays campaign name', () => {
    const { getByText } = render(
      <MemoryRouter>
        <CampaignCard campaign={mockCampaign} />
      </MemoryRouter>
    )
    expect(getByText('Test Campaign')).toBeTruthy()
  })
})
