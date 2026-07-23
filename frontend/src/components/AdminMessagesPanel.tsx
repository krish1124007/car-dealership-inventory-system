import { useEffect, useState } from 'react'
import { Inbox, Mail } from 'lucide-react'
import { Loading } from './Loading'
import { useToast } from './Toast'
import { formatMoment } from './AdminUsersPanel'
import { listContactMessages } from '../api/contact.api'
import type { ContactMessage } from '../api/schemas'

/** What visitors have written through the public contact form. */
export function AdminMessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [total, setTotal] = useState(0)
  const toast = useToast()

  useEffect(() => {
    listContactMessages()
      .then((data) => {
        setMessages(data.messages)
        setTotal(data.total)
      })
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : 'Failed to load messages',
        ),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      aria-label="Contact messages"
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 font-semibold text-gray-900">
            <Inbox size={17} className="text-emerald-600" />
            Messages from visitors
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Sent through the contact form, newest first.
          </p>
        </div>
        <p className="text-right">
          <span className="block font-hero text-2xl text-gray-900 leading-none">
            {total}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-gray-400">
            received
          </span>
        </p>
      </div>

      {messages === null ? (
        <Loading label="Loading messages…" />
      ) : messages.length === 0 ? (
        <div className="px-6 py-12 flex flex-col items-center gap-2 text-gray-400">
          <Mail size={26} strokeWidth={1.5} />
          <p className="text-sm">No messages yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {messages.map((message) => (
            <li key={message.id} className="px-6 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-semibold text-gray-900">
                  {message.name}{' '}
                  <a
                    href={`mailto:${message.email}`}
                    className="font-normal text-sm text-blue-600 hover:text-blue-500 underline underline-offset-2"
                  >
                    {message.email}
                  </a>
                </p>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {formatMoment(message.createdAt)}
                </p>
              </div>
              {message.subject && (
                <p className="text-sm font-medium text-gray-700 mt-1.5">
                  {message.subject}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
