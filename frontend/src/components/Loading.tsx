/** Full-width loading state using the brand loader animation. */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-gray-400 py-16">
      <img src="/loaders/loader1.gif" alt="" className="w-30 h-20" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
