import { describe, expect, it } from 'vitest'
import { buildStatusLine } from '../src/index'
import { estimateCost, status } from '../src/features/budget-manager/index'

describe('dsh-freeai-bridge', () => {
  it('formatira status liniju', () => {
    expect(buildStatusLine(1.99, 0.79)).toBe('fond $1.99 / preostalo $0.79')
  })

  it('proceni trosak chat modela', () => {
    expect(estimateCost('deepseek/deepseek-chat', 1_000_000, 0)).toBeCloseTo(0.27, 5)
  })

  it('status vrati brojeve', () => {
    const st = status(0.85, 50)
    expect(typeof st.earnedUsd).toBe('number')
    expect(typeof st.blocked).toBe('boolean')
  })
})
