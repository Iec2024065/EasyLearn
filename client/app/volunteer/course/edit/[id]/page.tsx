"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditCoursePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const { id } = params

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/course/${id}`)
        if (response.ok) {
          const data = await response.json()
          setTitle(data.title)
          setDescription(data.course_description)
          setContent(data.content)
        } else {
          setError("Failed to fetch course data")
        }
      } catch (err) {
        setError("Failed to fetch course data")
      }
    }

    if (id) {
      fetchCourse()
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`http://127.0.0.1:5000/course/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, content }),
      })

      if (response.ok) {
        router.push("/volunteer/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update course")
      }
    } catch (err) {
      setError("Failed to update course")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={10}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Course"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
