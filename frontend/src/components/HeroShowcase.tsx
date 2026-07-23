import { useState } from 'react'

interface DriveMode {
  name: string
  photo: string
}

const modes: DriveMode[] = [
  { name: 'Fast', photo: '/landing-photo/p1.png' },
  { name: 'Furious', photo: '/landing-photo/p2.png' },
  { name: 'Flawless', photo: '/landing-photo/p3.png' },
]

const logoRail1 = [
  '/car-logo/list1/l1.png',
  '/car-logo/list1/l2.png',
  '/car-logo/list1/l3.png',
]

const logoRail2 = [
  '/car-logo/list2/l1.png',
  '/car-logo/list2/l2.png',
  '/car-logo/list2/l3.png',
]

/** Vertical auto-scrolling rail of brand logos. */
function LogoRail({ logos, reverse }: { logos: string[]; reverse?: boolean }) {
  // Doubled so the translateY(-50%) loop feels continuous.
  const doubled = [...logos, ...logos, ...logos]
  return (
    <div className="w-36 xl:w-44 h-full overflow-hidden border-l border-gray-100 flex justify-center">
      <div
        className={`flex flex-col items-center gap-16 ${
          reverse ? 'animate-logo-scroll-reverse' : 'animate-logo-scroll'
        }`}
      >
        {doubled.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            className="w-16 h-16 xl:w-20 xl:h-20 object-contain rounded-2xl"
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Full-screen light hero: the landing photo swaps with the drive-mode
 * tabs, a huge ghost watermark echoes the active mode, and brand logos
 * drift down the right rails.
 */
export function HeroShowcase() {
  const [active, setActive] = useState(0)

  return (
    <section
      aria-label="Hero"
      className="relative w-full overflow-hidden bg-white border-b border-gray-200 h-[calc(100vh-4rem)] min-h-[560px]"
    >
      <div className="relative h-full flex">
        {/* Landing photo, crossfading between modes. */}
        <div className="flex-1 relative h-full">
          {modes.map((m, index) => (
            <img
              key={m.name}
              src={m.photo}
              alt={`${m.name} mode`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
                index === active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Brand logo rails. */}
        <div className="hidden lg:flex h-full shrink-0">
          <LogoRail logos={logoRail1} />
          <LogoRail logos={logoRail2} reverse />
        </div>
      </div>

      {/* Drive-mode tabs. */}
      <div className="absolute bottom-8 left-4 sm:left-10 z-10">
        <div className="inline-flex items-center gap-1 rounded-full bg-gray-100/90 backdrop-blur border border-gray-200 p-1.5 shadow-sm">
          {modes.map((m, index) => (
            <button
              key={m.name}
              onClick={() => setActive(index)}
              className={`rounded-full px-6 sm:px-8 py-2.5 text-sm font-semibold transition-all duration-300 ${
                index === active
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
