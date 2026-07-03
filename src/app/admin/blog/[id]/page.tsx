import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BlogPostForm } from '@/components/admin/blog-post-form'

interface EditBlogPostPageProps {
  params: { id: string }
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const supabase = createClient()
  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', params.id).single()

  if (!post) notFound()

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Edit post</h1>
      <div className="mt-6">
        <BlogPostForm initial={post} />
      </div>
    </div>
  )
}
