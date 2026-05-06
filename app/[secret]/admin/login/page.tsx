import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionOptions, SessionData } from '../../../../lib/session'
import AdminLoginForm from '../../../components/AdminLoginForm'

type Props = {
  params: Promise<{ secret: string }>
}

export default async function LoginPage({ params }: Props) {
  const { secret } = await params
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (session.isLoggedIn) {
    redirect(`/${secret}/admin`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AdminLoginForm secret={secret} />
    </div>
  )
}
