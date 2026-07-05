
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  image_alt: string;
  image_caption: string;
  is_approved: boolean;
}

export default function ViewBlogPage() {
  const { id } = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return

    const fetchBlog = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/volunteer/blog/${id}`)
        if (response.ok) {
          const data: Blog = await response.json()
          setBlog(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to fetch blog details.")
        }
      } catch (err) {
        setError("Connection failed. Please check if the server is running.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [id])

  if (isLoading) return <p>Loading blog...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!blog) return <p>Blog not found.</p>

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">{blog.title}</h1>
        <div className="mb-6">
          {blog.image_url && (
            <img src={blog.image_url} alt={blog.image_alt || blog.title} className="w-full h-64 object-cover rounded-md mb-4" />
          )}
          {blog.image_caption && (
            <p className="text-sm text-muted-foreground mb-4">{blog.image_caption}</p>
          )}
          <div className="prose dark:prose-invert">
            {/* Render blog content, assuming it's HTML or Markdown */}
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
        </div>
        <div className="flex gap-4">
          <Link href={`/volunteer/edit-blog/${blog.id}`}>
            <Button>Edit Blog</Button>
          </Link>
          <Link href="/volunteer/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
