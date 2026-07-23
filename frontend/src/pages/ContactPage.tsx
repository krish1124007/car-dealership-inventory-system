import { useState } from 'react'
import type { FormEvent } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { useToast } from '../components/Toast'
import { sendContactMessage } from '../api/contact.api'

const fieldClasses =
  'w-full rounded-xl bg-white border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition'

const emptyForm = { name: '', email: '', subject: '', message: '' }

const reachUs = [
  { icon: <Phone size={15} />, label: 'Call', value: '+91 98250 00000' },
  { icon: <Mail size={15} />, label: 'Email', value: 'hello@cardealership.com' },
  {
    icon: <MapPin size={15} />,
    label: 'Showroom',
    value: 'SG Highway, Ahmedabad',
  },
]

/** Public contact form — anyone can write in, no account needed. */
export function ContactPage() {
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const toast = useToast()

  function setField(key: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSending(true)
    try {
      const subject = form.subject.trim()
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: subject || undefined,
        message: form.message.trim(),
      })
      // Only clear once it actually went through — a failed send must not
      // destroy what the visitor typed.
      setForm(emptyForm)
      toast.success('Message sent — we usually reply within a day.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <AppLayout
      title="Contact us"
      subtitle="Questions about a car, a test drive or an exchange? Write to us."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Your name
              </label>
              <input
                id="contact-name"
                required
                placeholder="Riya Sharma"
                className={fieldClasses}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                placeholder="you@example.com"
                className={fieldClasses}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="contact-subject"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Subject{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="contact-subject"
                placeholder="Test drive for the Creta"
                className={fieldClasses}
                value={form.subject}
                onChange={(e) => setField('subject', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={6}
                placeholder="Tell us what you are looking for…"
                className={`${fieldClasses} resize-y`}
                value={form.message}
                onChange={(e) => setField('message', e.target.value)}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              We reply to every enquiry, usually within a day.
            </p>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-onaccent text-sm font-semibold px-6 py-2.5 shadow-sm transition"
            >
              <Send size={15} />
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>

        <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-gray-900">
            Reach us directly
          </h2>
          <dl className="space-y-4">
            {reachUs.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {item.icon}
                </span>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {item.label}
                  </dt>
                  <dd className="text-sm font-medium text-gray-800 mt-0.5">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
            Showroom hours are 9am to 8pm, Monday to Saturday.
          </p>
        </aside>
      </div>
    </AppLayout>
  )
}
