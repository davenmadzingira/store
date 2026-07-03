import { BlogPostForm } from '@/components/admin/blog-post-form'

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">New blog post</h1>
      <div className="mt-6">
        <BlogPostForm />
      </div>
    </div>
  )
}
