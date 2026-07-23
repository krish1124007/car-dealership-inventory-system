import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

interface Banner {
  eyebrow: string
  title: string
  subtitle: string
  image: string
  accent: string
}

const banners: Banner[] = [
  {
    eyebrow: 'Premium showroom',
    title: 'Find your dream car today',
    subtitle:
      'Hand-picked premium cars, transparent pricing and instant purchase.',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=70',
    accent: 'from-gray-950/85 via-gray-900/55',
  },
  {
    eyebrow: 'New arrivals',
    title: 'New EVs & coupes in stock',
    subtitle:
      'Fresh arrivals every week — from family sedans to sports coupes.',
    image:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=70',
    accent: 'from-blue-950/85 via-blue-900/55',
  },
  {
    eyebrow: 'Weekend ready',
    title: 'Adventure-ready SUVs',
    subtitle: 'Built for every road. Restocked weekly, ready to drive home.',
    image:
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=70',
    accent: 'from-emerald-950/85 via-emerald-900/55',
  },
]

const AUTO_ADVANCE_MS = 5000

/** Auto-advancing promotional carousel with dot navigation. */
export function BannerCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % banners.length),
      AUTO_ADVANCE_MS,
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      aria-label="Promotions"
      className="relative rounded-3xl overflow-hidden shadow-lg shadow-gray-200/80 h-72 sm:h-96"
    >
      {banners.map((banner, index) => (
        <div
          key={banner.title}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={banner.image}
            alt=""
            className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
              index === active ? 'scale-105' : 'scale-100'
            }`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${banner.accent} to-transparent`}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14 max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              <Sparkles size={12} />
              {banner.eyebrow}
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              {banner.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/80 max-w-md leading-relaxed">
              {banner.subtitle}
            </p>
            <Link
              to="/cars"
              className="mt-7 inline-flex items-center gap-2 self-start rounded-full bg-white text-gray-900 hover:bg-blue-600 hover:text-white text-sm font-semibold px-7 py-3 shadow-lg transition-colors duration-300"
            >
              Browse cars
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.title}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === active
                ? 'w-8 bg-white'
                : 'w-3 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
