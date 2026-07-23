import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SplashScreen } from './SplashScreen'

/** Fake Image that resolves (or fails) on the next tick. */
function stubImage(outcome: 'load' | 'error') {
  class FakeImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) {
      setTimeout(() => {
        if (outcome === 'load') this.onload?.()
        else this.onerror?.()
      }, 0)
    }
  }
  vi.stubGlobal('Image', FakeImage as unknown as typeof Image)
}

beforeEach(() => {
  stubImage('load')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SplashScreen', () => {
  it('shows the car loader and hides the app while assets preload', () => {
    render(
      <SplashScreen minimumMs={50}>
        <div>THE APP</div>
      </SplashScreen>,
    )

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    expect(screen.queryByText('THE APP')).not.toBeInTheDocument()
  })

  it('reveals the app once the critical images have settled', async () => {
    render(
      <SplashScreen minimumMs={0}>
        <div>THE APP</div>
      </SplashScreen>,
    )

    expect(await screen.findByText('THE APP')).toBeInTheDocument()
    expect(
      screen.queryByRole('status', { name: /loading/i }),
    ).not.toBeInTheDocument()
  })

  it('still reveals the app when images fail to load', async () => {
    stubImage('error')
    render(
      <SplashScreen minimumMs={0}>
        <div>THE APP</div>
      </SplashScreen>,
    )

    expect(await screen.findByText('THE APP')).toBeInTheDocument()
  })
})
