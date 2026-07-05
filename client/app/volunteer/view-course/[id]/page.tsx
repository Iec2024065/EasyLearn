
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Course {
  id: number;
  title: string;
  course_description: string;
  thumbnail_url: string;
  video_url: string;
  content: string;
  is_approved: boolean;
}

export default function ViewCoursePage() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return

    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/volunteer/course/${id}`)
        if (response.ok) {
          const data: Course = await response.json()
          setCourse(data)
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

  if (isLoading) return <p>Loading course...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!course) return <p>Course not found.</p>

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">{course.title}</h1>
        <div className="mb-6">
          {course.thumbnail_url && (
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-64 object-cover rounded-md mb-4" />
          )}
          {course.video_url && (
            <div className="aspect-video w-full mb-4">
              <iframe
                src={course.video_url}
                title={course.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-md"
              ></iframe>
            </div>
          )}
          <p className="text-muted-foreground text-lg mb-4">{course.course_description}</p>
          <div className="prose dark:prose-invert">
            {/* Render course content, assuming it's HTML or Markdown */}
            <div dangerouslySetInnerHTML={{ __html: course.content }} />
          </div>
        </div>
        <div className="flex gap-4">
          <Link href={`/volunteer/edit-course/${course.id}`}>
            <Button>Edit Course</Button>
          </Link>
          <Link href="/volunteer/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
