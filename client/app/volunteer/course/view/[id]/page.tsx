"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ViewCoursePage() {
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const params = useParams()
  const { id } = params

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/course/${id}`)
        if (response.ok) {
          const data = await response.json()
          setCourse(data)
        } else {
          setError("Failed to fetch course data")
        }
      } catch (err) {
        setError("Failed to fetch course data")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCourse()
    }
  }, [id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.course_description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: course.content }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
