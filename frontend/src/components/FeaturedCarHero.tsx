import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface FeaturedCar {
  brand: string
  model: string
  photo: string
}

const cars: FeaturedCar[] = [
  { brand: 'Hyundai', model: 'Creta', photo: '/landing-photo/p1-show.png' },
  { brand: 'Ford', model: 'Mustang', photo: '/landing-photo/p2-show.png' },
  { brand: 'BMW', model: 'M340i', photo: '/landing-photo/p3-show.png' },
]

const AUTO_ADVANCE_MS = 5000

/**
 * Landing hero in the Arcar style: one car centered with its name huge
 * behind it; the active car slides out to the left while the next one
 * glides in from the right.
 */
export function FeaturedCarHero() {
  const [active, setActive] = useState(0)

  const next = () => setActive((i) => (i + 1) % cars.length)
  const prev = () => setActive((i) => (i - 1 + cars.length) % cars.length)

  // Auto-advance; resets whenever the slide changes (incl. manual nav).
  useEffect(() => {
    const timer = setInterval(next, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [active])

  const prevIndex = (active - 1 + cars.length) % cars.length

  return (
    <section
      aria-label="Featured cars"
      className="relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200 h-[70vh] min-h-[460px] sm:h-[calc(100vh-4rem)] sm:min-h-[560px]"
    >
      {/* Name layer: the old name lifts up and away while the new one
          rises in from below. */}
      {cars.map((car, index) => {
        const position =
          index === active ? 'active' : index === prevIndex ? 'prev' : 'next'
        return (
          <div
            key={`${car.model}-name`}
            className={`absolute inset-x-0 top-[10%] sm:top-[8%] text-center select-none pointer-events-none transition-all duration-700 ease-in-out ${
              position === 'active'
                ? 'translate-y-0 opacity-100'
                : position === 'prev'
                  ? '-translate-y-16 opacity-0'
                  : 'translate-y-16 opacity-0'
            }`}
          >
            <p className="text-lg sm:text-3xl font-bold uppercase tracking-[0.4em] text-gray-800">
              {car.brand}
            </p>
            <p className="font-display text-[21vw] sm:text-[16vw] leading-[0.9] font-extrabold uppercase text-gray-900/10 -mt-1">
              {car.model}
            </p>
          </div>
        )
      })}

      {/* Car layer: only the photo drives across — out to the left,
          in from the right. */}
      {cars.map((car, index) => {
        const position =
          index === active ? 'active' : index === prevIndex ? 'prev' : 'next'
        return (
          <div
            key={car.model}
            className={`absolute inset-0 flex items-center justify-center pt-[14vh] sm:pt-[16vh] pb-24 transition-transform duration-700 ease-in-out ${
              position === 'active'
                ? 'translate-x-0'
                : position === 'prev'
                  ? '-translate-x-[120%]'
                  : 'translate-x-[120%]'
            }`}
          >
            <img
              src={car.photo}
              alt={`${car.brand} ${car.model}`}
              className="w-[min(96%,66rem)] max-h-[64%] object-contain drop-shadow-2xl"
            />
          </div>
        )
      })}

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous car"
        className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/80 backdrop-blur border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm flex items-center justify-center transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next car"
        className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/80 backdrop-blur border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm flex items-center justify-center transition"
      >
        <ChevronRight size={20} />
      </button>

      {/* Call to action */}
      <div className="absolute inset-x-0 bottom-16 sm:bottom-20 z-10 flex justify-center">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white hover:bg-blue-600 text-sm font-semibold px-8 py-3 shadow-lg transition-colors duration-300"
        >
          Browse cars
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {cars.map((car, index) => (
          <button
            key={car.model}
            aria-label={`Go to car ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === active
                ? 'w-8 bg-gray-900'
                : 'w-3 bg-gray-400/50 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
