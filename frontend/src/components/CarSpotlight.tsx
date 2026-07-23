import { useState } from 'react'
import { Sparkles } from 'lucide-react'

interface Colour {
  name: string
  photo: string
  swatch: string
}

const colours: Colour[] = [
  { name: 'White', photo: '/cars/creata.png', swatch: '#f9fafb' },
  { name: 'Brown', photo: '/cars/creata-brown.png', swatch: '#6b4a35' },
  { name: 'Black', photo: '/cars/creata-black.png', swatch: '#111827' },
]

interface Feature {
  number: number
  title: string
  description: string
  /** Dot position on the photo, as percentages. */
  x: string
  y: string
}

const leftFeatures: Feature[] = [
  {
    number: 1,
    title: 'Roof rails',
    description: 'Adventure-ready as standard — strap on and go.',
    x: '38%',
    y: '10%',
  },
  {
    number: 2,
    title: 'Diamond-cut alloys',
    description: 'Dual-tone machined wheels that catch every eye.',
    x: '16%',
    y: '72%',
  },
]

const rightFeatures: Feature[] = [
  {
    number: 3,
    title: 'LED projector headlamps',
    description: 'Crystal-clear beam with signature DRLs.',
    x: '78%',
    y: '45%',
  },
  {
    number: 4,
    title: 'Cascading chrome grille',
    description: "Hyundai's bold signature face up front.",
    x: '60%',
    y: '52%',
  },
]

const allFeatures = [...leftFeatures, ...rightFeatures]

function FeatureCard({
  feature,
  align,
}: {
  feature: Feature
  align: 'left' | 'right'
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition ${
        align === 'right' ? 'lg:text-right' : ''
      }`}
    >
      <div
        className={`flex items-center gap-2.5 ${
          align === 'right' ? 'lg:flex-row-reverse' : ''
        }`}
      >
        <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          {feature.number}
        </span>
        <h3 className="font-semibold text-gray-900 text-sm">
          {feature.title}
        </h3>
      </div>
      <p className="mt-2 text-xs text-gray-500 leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}

/** Single-car feature spotlight: the photo carries numbered pulse dots
 * matching the callout cards on either side, with colour swatches to
 * switch the paint. */
export function CarSpotlight() {
  const [colour, setColour] = useState(0)
  const active = colours[colour]!

  return (
    <section
      aria-label="Car spotlight"
      className="bg-white border-b border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            <Sparkles size={12} />
            Spotlight
          </p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Hyundai Creta
          </h2>
          <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">
            The family SUV that has it all — take a closer look at what makes
            it special.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_minmax(0,34rem)_1fr] items-center">
          {/* Left callouts */}
          <div className="space-y-4 order-2 lg:order-1">
            {leftFeatures.map((feature) => (
              <FeatureCard key={feature.number} feature={feature} align="right" />
            ))}
          </div>

          {/* Photo with numbered pulse dots */}
          <div className="relative order-1 lg:order-2">
            <img
              key={active.photo}
              src={active.photo}
              alt="Hyundai Creta"
              className="w-full h-auto animate-[menu-in_300ms_ease-out]"
            />
            {allFeatures.map((feature) => (
              <span
                key={feature.number}
                aria-hidden
                className="hidden lg:flex absolute -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: feature.x, top: feature.y }}
              >
                <span className="absolute w-6 h-6 rounded-full bg-blue-500/40 animate-ping" />
                <span className="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow text-white text-[10px] font-bold flex items-center justify-center">
                  {feature.number}
                </span>
              </span>
            ))}
          </div>

          {/* Right callouts */}
          <div className="space-y-4 order-3">
            {rightFeatures.map((feature) => (
              <FeatureCard key={feature.number} feature={feature} align="left" />
            ))}
          </div>
        </div>

        {/* Colour swatches */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Available colours
          </p>
          <div className="flex items-center gap-3">
            {colours.map((c, index) => (
              <button
                key={c.name}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColour(index)}
                className={`w-9 h-9 rounded-full border border-gray-200 shadow-sm transition-all duration-300 ${
                  index === colour
                    ? 'ring-2 ring-blue-500 ring-offset-2 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.swatch }}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-gray-900">{active.name}</p>
        </div>
      </div>
    </section>
  )
}
