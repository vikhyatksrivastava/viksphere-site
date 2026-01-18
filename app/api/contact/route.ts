import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || !body.message) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  try {
    const msg = await prisma.contactMessage.create({ data: {
      name: body.name || null,
      email: body.email || null,
      message: body.message,
    }})

    // TODO: send email backup via SMTP or third-party

    return NextResponse.json({ success: true, id: msg.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
