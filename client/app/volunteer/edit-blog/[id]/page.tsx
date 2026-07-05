"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

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

export default function EditBlogPage() {
  const { id } = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [imageCaption, setImageCaption] = useState("")

  useEffect(() => {
    if (!id) return

    const fetchBlog = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/volunteer/blog/${id}`)
        if (response.ok) {
          const data: Blog = await response.json()
          setBlog(data)
          setTitle(data.title)
          setSlug(data.slug)
          setContent(data.content)
          setImageUrl(data.image_url || "")
          setImageAlt(data.image_alt || "")
          setImageCaption(data.image_caption || "")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`http://127.0.0.1:5000/volunteer/blog/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          image_url: imageUrl,
          image_alt: imageAlt,
          image_caption: imageCaption,
        }),
      })

      if (response.ok) {
        router.push(`/volunteer/view-blog/${id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update blog.")
      }
    } catch (err) {
      setError("Connection failed. Please check if the server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !blog) return <p>Loading blog...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!blog && !isLoading) return <p>Blog not found.</p>

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">Edit Blog: {blog?.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">
              Blog Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the blog title"
              required
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-muted-foreground mb-2">
              Slug
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Enter a unique slug for the blog"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-muted-foreground mb-2">
              Blog Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your amazing blog post here..."
              required
              rows={10}
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-muted-foreground mb-2">
              Image URL (Optional)
            </label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label htmlFor="imageAlt" className="block text-sm font-medium text-muted-foreground mb-2">
              Image Alt Text (Optional)
            </label>
            <Input
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Alt text for accessibility"
            />
          </div>
          <div>
            <label htmlFor="imageCaption" className="block text-sm font-medium text-muted-foreground mb-2">
              Image Caption (Optional)
            </label>
            <Input
              id="imageCaption"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Caption for the image"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>Update Blog</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}