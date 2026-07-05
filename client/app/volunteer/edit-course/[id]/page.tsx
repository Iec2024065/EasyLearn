
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface Course {
  id: number;
  title: string;
  course_description: string;
  thumbnail_url: string;
  video_url: string;
  content: string;
  is_approved: boolean;
}

export default function EditCoursePage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (!id) return

    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/volunteer/course/${id}`)
        if (response.ok) {
          const data: Course = await response.json()
          setCourse(data)
          setTitle(data.title)
          setDescription(data.course_description)
          setThumbnailUrl(data.thumbnail_url || "")
          setVideoUrl(data.video_url || "")
          setContent(data.content || "")
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to fetch course details.")
        }
      } catch (err) {
        setError("Connection failed. Please check if the server is running.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`http://127.0.0.1:5000/volunteer/course/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          course_description: description,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          content,
        }),
      })

      if (response.ok) {
        router.push(`/volunteer/view-course/${id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update course.")
      }
    } catch (err) {
      setError("Connection failed. Please check if the server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !course) return <p>Loading course...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!course && !isLoading) return <p>Course not found.</p>

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">Edit Course: {course?.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">
              Course Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the course title"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">
              Course Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the course"
              required
              rows={6}
            />
          </div>
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-muted-foreground mb-2">
              Thumbnail URL (Optional)
            </label>
            <Input
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-muted-foreground mb-2">
              Video URL (Optional)
            </label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-muted-foreground mb-2">
              Course Content (HTML/Markdown)
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the course content here..."
              rows={15}
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>Update Course</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
