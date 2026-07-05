"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export default function AddCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

    try {
      const response = await fetch("http://127.0.0.1:5000/volunteer/add-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          course_description: description,
          video_url: videoUrl,
          author_id: volunteer_id,
        }),
      })

      if (response.ok) {
        setSuccess("Course submitted for review successfully!")
        setTitle("")
        setDescription("")
        setVideoUrl("")
        router.push("/volunteer/dashboard?tab=my-courses") // Redirect to dashboard
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit course.")
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
        <h1 className="text-4xl font-bold text-foreground mb-8">Create a New Course</h1>
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