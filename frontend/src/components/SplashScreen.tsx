import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CarFront } from 'lucide-react'

/** Images the site needs before the first paint feels complete. */
const CRITICAL_ASSETS = [
  '/logo/logo_cars.png',
  '/landing-photo/p1.png',
  '/landing-photo/p2.png',
  '/landing-photo/p3.png',
  '/landing-photo/p1-show.png',
  '/landing-photo/p2-show.png',
  '/landing-photo/p3-show.png',
  '/cars/creata.png',
  '/cars/creata-brown.png',
  '/cars/creata-black.png',
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
  const [loaded, setLoaded] = useState(0)

  useEffect(() => {
    let cancelled = false

    const assets = Promise.all(
      CRITICAL_ASSETS.map((src) =>
        preloadImage(src).then(() => {
          if (!cancelled) setLoaded((n) => n + 1)
        }),
      ),
    )
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
    // Real progress, not a decorative spinner — the bar tracks how many
    // critical images have actually settled.
    const percent = Math.round((loaded / CRITICAL_ASSETS.length) * 100)

    return (
      <div
        role="status"
        aria-label="Loading"
        className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-8 px-6"
      >
        <p className="font-hero text-5xl sm:text-6xl uppercase tracking-[0.18em] text-gray-900 leading-none">
          Car Dealership
        </p>

        <div className="relative w-64 max-w-[70vw]">
          <CarFront
            size={20}
            aria-hidden
            className="absolute bottom-full mb-2 -translate-x-1/2 text-gray-900 transition-[left] duration-500 ease-out"
            style={{ left: `${percent}%` }}
          />
          <span className="block h-[3px] w-full rounded-full bg-gray-200 overflow-hidden">
            <span
              className="block h-full rounded-full bg-blue-600 transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </span>
        </div>

        <p className="text-xs text-gray-400 tabular-nums tracking-wide">
          Warming up the showroom · {percent}%
        </p>
      </div>
    )
  }

  return <>{children}</>
}
