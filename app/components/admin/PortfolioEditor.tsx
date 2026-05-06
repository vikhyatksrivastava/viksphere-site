'use client'
import { useState } from 'react'

interface PortfolioData {
  headline: string; tagline: string; bio: string
  name: string; title: string; location: string; about: string
  skills: string[]
  experience: { id: string; company: string; role: string; period: string; description: string }[]
  education: { id: string; institution: string; degree: string; period: string }[]
  certifications: string[]
  links: { linkedin?: string; github?: string; email?: string }
}

export default function PortfolioEditor({ initial }: { initial: PortfolioData }) {
  const [data, setData] = useState<PortfolioData>(initial)
  const [skillsRaw, setSkillsRaw] = useState(initial.skills.join(', '))
  const [certsRaw, setCertsRaw] = useState((initial.certifications ?? []).join('\n'))
  const [expRaw, setExpRaw] = useState(JSON.stringify(initial.experience, null, 2))
  const [eduRaw, setEduRaw] = useState(JSON.stringify(initial.education, null, 2))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function set<K extends keyof PortfolioData>(key: K, val: PortfolioData[K]) {
    setData(d => ({ ...d, [key]: val }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')

    let experience, education
    try { experience = JSON.parse(expRaw) } catch { setError('Experience JSON is invalid'); return }
    try { education  = JSON.parse(eduRaw)  } catch { setError('Education JSON is invalid');  return }

    const skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    const certifications = certsRaw.split('\n').map(s => s.trim()).filter(Boolean)
    setSaving(true)

    const res = await fetch('/api/admin/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, skills, certifications, experience, education }),
    })
    const result = await res.json()
    if (res.ok) {
      setSuccess('Saved. Refresh the public site to see changes.')
    } else {
      setError(result.error ?? 'Save failed')
    }
    setSaving(false)
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
  const labelCls = 'block text-sm font-medium mb-1'

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700 w-full">Hero Banner</legend>
        <div><label className={labelCls}>Site Headline</label><input className={inputCls} value={data.headline} onChange={e => set('headline', e.target.value)} /></div>
        <div><label className={labelCls}>Tagline</label><textarea className={inputCls} rows={2} value={data.tagline} onChange={e => set('tagline', e.target.value)} /></div>
        <div><label className={labelCls}>Signature / Bio</label><input className={inputCls} value={data.bio} onChange={e => set('bio', e.target.value)} placeholder="— Vikhyat" /></div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700 w-full">About You</legend>
        <div><label className={labelCls}>Full Name</label><input className={inputCls} value={data.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label className={labelCls}>Professional Title</label><input className={inputCls} value={data.title} onChange={e => set('title', e.target.value)} placeholder="Data & AI Engineer · Traveler" /></div>
        <div><label className={labelCls}>Location</label><input className={inputCls} value={data.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="Barcelona, Spain" /></div>
        <div><label className={labelCls}>About Paragraph</label><textarea className={inputCls} rows={4} value={data.about} onChange={e => set('about', e.target.value)} /></div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700 w-full">Skills</legend>
        <div>
          <label className={labelCls}>Skills <span className="font-normal text-slate-400">(comma-separated)</span></label>
          <input className={inputCls} value={skillsRaw} onChange={e => setSkillsRaw(e.target.value)} placeholder="Python, Databricks, Next.js, Photography" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700 w-full">Experience <span className="font-normal text-sm">(JSON)</span></legend>
        <textarea className={`${inputCls} font-mono text-xs`} rows={10} value={expRaw} onChange={e => setExpRaw(e.target.value)} />
        <p className="text-xs text-slate-400">Each item: {"{ \"id\", \"company\", \"role\", \"period\", \"description\" }"}</p>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700 w-full">Education <span className="font-normal text-sm">(JSON)</span></legend>
        <textarea className={`${inputCls} font-mono text-xs`} rows={6} value={eduRaw} onChange={e => setEduRaw(e.target.value)} />
        <p className="text-xs text-slate-400">Each item: {"{ \"id\", \"institution\", \"degree\", \"period\" }"}</p>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700 w-full">Certifications</legend>
        <div>
          <label className={labelCls}>Certifications <span className="font-normal text-slate-400">(one per line)</span></label>
          <textarea className={`${inputCls}`} rows={8} value={certsRaw} onChange={e => setCertsRaw(e.target.value)} placeholder={"Google Cloud Professional Data Engineer\nAWS Certified Cloud Practitioner"} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-700 w-full">Links</legend>
        <div><label className={labelCls}>LinkedIn URL</label><input type="url" className={inputCls} value={data.links.linkedin ?? ''} onChange={e => set('links', { ...data.links, linkedin: e.target.value })} /></div>
        <div><label className={labelCls}>GitHub URL</label><input type="url" className={inputCls} value={data.links.github ?? ''} onChange={e => set('links', { ...data.links, github: e.target.value })} /></div>
        <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={data.links.email ?? ''} onChange={e => set('links', { ...data.links, email: e.target.value })} /></div>
      </fieldset>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

      <button type="submit" disabled={saving}
        className="px-6 py-2.5 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-600 disabled:opacity-50 transition-colors">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
