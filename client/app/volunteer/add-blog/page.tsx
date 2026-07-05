"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export default function AddBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with - 
      .replace(/[^a-z0-9-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single - 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const volunteer_id = localStorage.getItem("volunteer_id")
    if (!volunteer_id) {
      setError("Volunteer ID not found. Please log in again.")
      setIsLoading(false)
      return
    }

    const slug = generateSlug(title) // Generate slug from title

    try {
      const response = await fetch("http://127.0.0.1:5000/volunteer/add-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          image_url: imageUrl,
          author_id: volunteer_id,
        }),
      })

      if (response.ok) {
        setSuccess("Blog submitted for review successfully!")
        setTitle("")
        setContent("")
        setImageUrl("")
        router.push("/volunteer/dashboard?tab=activity") // Redirect to dashboard activity tab
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit blog.")
      }
    } catch (err) {
      setError("Connection failed. Please check if the server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Create a New Blog Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">
              Blog Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title"
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
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>
      </div>
    </div>
  )
}