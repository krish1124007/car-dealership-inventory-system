import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

/** Images the site needs before the first paint feels complete. */
const CRITICAL_ASSETS = [
  '/logo/logo_cars.png',
  '/landing-photo/p1.png',
  '/landing-photo/p2.png',
  '/landing-photo/p3.png',
  '/cars/creata.png',
  '/car-logo/list1/l1.png',
  '/car-logo/list1/l2.png',
  '/car-logo/list1/l3.png',
  '/car-logo/list2/l1.png',
  '/car-logo/list2/l2.png',
  '/car-logo/list2/l3.png',
]

/** Resolves when the image loads or fails — never rejects. */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

/**
 * Full-screen car-loader shown while the site's critical images preload.
 * A safety timeout guarantees a broken asset can never lock visitors out,
 * and a minimum display time avoids a jarring flash on fast connections.
 */
export function SplashScreen({
  children,
  minimumMs = 700,
  timeoutMs = 6000,
}: {
  children: ReactNode
  minimumMs?: number
  timeoutMs?: number
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const assets = Promise.all(CRITICAL_ASSETS.map(preloadImage))
    const safetyCap = new Promise<void>((resolve) =>
      setTimeout(resolve, timeoutMs),
    )
    const minimum = new Promise<void>((resolve) =>
      setTimeout(resolve, minimumMs),
    )

    void Promise.all([Promise.race([assets, safetyCap]), minimum]).then(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [minimumMs, timeoutMs])

  if (!ready) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="fixed inset-0 z-50 bg-white flex items-center justify-center"
      >
        <img src="/loaders/loader1.gif" alt="" className="w-72 max-w-[75vw]" />
      </div>
    )
  }

  return <>{children}</>
}
