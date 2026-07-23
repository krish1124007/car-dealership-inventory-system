import { useEffect, useState } from 'react'
import { Users, ShieldCheck } from 'lucide-react'
import { Loading } from './Loading'
import { useToast } from './Toast'
import { listUsers } from '../api/admin.api'
import type { AdminUser } from '../api/schemas'

/** "22 Jul 2026, 4:31 pm" — or a clear dash when it never happened. */
export function formatMoment(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Everyone registered on the site, with the last time each signed in. */
export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [total, setTotal] = useState(0)
  const toast = useToast()

  useEffect(() => {
    listUsers()
      .then((data) => {
        setUsers(data.users)
        setTotal(data.total)
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : 'Failed to load users'),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const admins = users?.filter((u) => u.role === 'ADMIN').length ?? 0
  const signedInEver = users?.filter((u) => u.lastLoginAt).length ?? 0

  return (
    <section
      aria-label="Registered users"
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 font-semibold text-gray-900">
            <Users size={17} className="text-blue-600" />
            Registered users
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Everyone with an account, and when they last signed in.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <p className="text-right">
            <span className="block font-hero text-2xl text-gray-900 leading-none">
              {total}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-gray-400">
              total
            </span>
          </p>
          <p className="text-right">
            <span className="block font-hero text-2xl text-gray-900 leading-none">
              {signedInEver}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-gray-400">
              signed in
            </span>
          </p>
          <p className="text-right">
            <span className="block font-hero text-2xl text-gray-900 leading-none">
              {admins}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-gray-400">
              admins
            </span>
          </p>
        </div>
      </div>

      {users === null ? (
        <Loading label="Loading users…" />
      ) : users.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-gray-400">
          Nobody has registered yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Last login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{user.email}</td>
                  <td className="px-5 py-3">
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5">
                        <ShieldCheck size={11} />
                        Admin
                      </span>
                    ) : (
                      <span className="text-gray-500">Customer</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {formatMoment(user.createdAt)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {user.lastLoginAt ? (
                      <span className="text-gray-700">
                        {formatMoment(user.lastLoginAt)}
                      </span>
                    ) : (
                      <span className="text-gray-400">Never signed in</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
