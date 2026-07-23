/** Full-width loading state: road markings streaming past under the label. */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3.5 py-16">
      <span className="lane-track block h-[3px] w-24 rounded-full text-blue-600" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}
