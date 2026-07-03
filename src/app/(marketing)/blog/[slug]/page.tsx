import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/database'
import type { Metadata } from 'next'

interface BlogPostPageProps {
  params: { slug: string }
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data as BlogPost | null
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    openGraph: {
      title: post.seo_title || post.title,
      type: 'article',
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <p className="shelf-label">{post.published_at && formatDate(post.published_at)}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink-900">{post.title}</h1>

      {post.cover_image_url && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-md bg-sand">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="prose prose-ink mt-8 max-w-none prose-headings:font-display prose-headings:text-ink-900 prose-a:text-signal-dark">
        <ReactMarkdown>{post.content_md}</ReactMarkdown>
      </div>
    </article>
  )
}
