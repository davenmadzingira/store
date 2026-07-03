import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sendgrid'

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message })

  if (error) {
    console.error('Contact message insert failed:', error)
    return NextResponse.json({ error: 'Could not send your message. Try again.' }, { status: 500 })
  }

  const adminEmail = process.env.SENDGRID_FROM_EMAIL
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `New contact form message: ${subject || 'No subject'}`,
      html: `<p><strong>${name}</strong> (${email}) wrote:</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
    })
  }

  return NextResponse.json({ success: true })
}
