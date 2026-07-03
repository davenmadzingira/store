import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function AdminBlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Blog</h1>
        <Link href="/admin/blog/new" className="rounded bg-ink-900 px-4 py-2 text-sm font-medium text-paper hover:bg-ink-700">
          + New post
        </Link>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink-900 text-left text-xs text-ink-400">
            <th className="py-2">Title</th>
            <th className="py-2">Status</th>
            <th className="py-2">Updated</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {posts?.map((post) => (
            <tr key={post.id}>
              <td className="py-3 font-medium text-ink-900">{post.title}</td>
              <td className="py-3">
                <span className={`rounded-sm px-2 py-0.5 text-xs capitalize ${post.status === 'published' ? 'bg-moss/10 text-moss' : 'bg-ink-100 text-ink-500'}`}>
                  {post.status}
                </span>
              </td>
              <td className="py-3 text-xs text-ink-400">{formatDate(post.updated_at)}</td>
              <td className="py-3 text-right">
                <Link href={`/admin/blog/${post.id}`} className="text-ink-500 hover:text-ink-900">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(!posts || posts.length === 0) && <p className="mt-10 text-sm text-ink-400">No posts yet.</p>}
    </div>
  )
}
