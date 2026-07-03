import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatDate, truncate } from '@/lib/utils'
import type { BlogPost } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes on what we are building and what we are recommending.',
}

export default async function BlogIndexPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="border-b border-ink-900 pb-4">
        <p className="shelf-label">Journal</p>
        <h1 className="mt-1 font-display text-3xl text-ink-900">Notes from the shelf</h1>
      </div>

      <div className="mt-8 divide-y divide-ink-100">
        {posts && posts.length > 0 ? (
          (posts as BlogPost[]).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-5 py-6">
              {post.cover_image_url && (
                <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-sand">
                  <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="text-xs text-ink-300">{post.published_at && formatDate(post.published_at)}</p>
                <h2 className="mt-1 font-display text-xl text-ink-900 group-hover:text-signal-dark">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  {post.excerpt || truncate(post.content_md.replace(/[#*_>`]/g, ''), 140)}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="py-10 text-sm text-ink-400">No posts published yet.</p>
        )}
      </div>
    </div>
  )
}
