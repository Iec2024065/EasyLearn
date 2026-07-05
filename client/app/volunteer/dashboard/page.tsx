"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardData {
  coursesCreated: number
  articlesWritten: number
}

interface Course {
  id: number;
  title: string;
  course_description: string;
  thumbnail_url: string;
  video_url: string;
  is_approved: boolean;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  is_approved: boolean;
}

interface VolunteerProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  is_approved: boolean;
}

export default function VolunteerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [userName, setUserName] = useState("Volunteer")
  const [activeTab, setActiveTab] = useState("my-courses")
  const [courses, setCourses] = useState<Course[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)

  useEffect(() => {
    let isFetched = false // ✅ Prevent duplicate fetches (React StrictMode dev)
    
    const fetchData = async () => {
      if (isFetched) return
      isFetched = true

      const storedName = localStorage.getItem("userName")
      if (storedName) setUserName(storedName)

      const volunteer_id = localStorage.getItem("volunteer_id")
      if (!volunteer_id) {
        setError("Volunteer ID not found. Please log in again.")
        setIsLoading(false)
        return
      }

      try {
        // Fetch dashboard stats
        const dashboardResponse = await fetch("http://127.0.0.1:5000/volunteer/dashboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ volunteer_id }),
        })

        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setDashboardData(data)
          setError("")
        } else {
          const errorData = await dashboardResponse.json()
          setError(errorData.error || "Failed to fetch dashboard data.")
        }

        // Fetch courses
        const coursesResponse = await fetch(`http://127.0.0.1:5000/volunteer/courses/${volunteer_id}`)
        if (coursesResponse.ok) {
          const coursesData: Course[] = await coursesResponse.json()
          setCourses(coursesData)
        } else {
          const errorData = await coursesResponse.json()
          setError(errorData.error || "Failed to fetch courses.")
        }

        // Fetch blogs
        const blogsResponse = await fetch(`http://127.0.0.1:5000/volunteer/blogs/${volunteer_id}`)
        if (blogsResponse.ok) {
          const blogsData: Blog[] = await blogsResponse.json()
          setBlogs(blogsData)
        } else {
          const errorData = await blogsResponse.json()
          setError(errorData.error || "Failed to fetch blogs.")
        }

        // Fetch profile
        const profileResponse = await fetch(`http://127.0.0.1:5000/volunteer/profile/${volunteer_id}`)
        if (profileResponse.ok) {
          const profileData: VolunteerProfile = await profileResponse.json()
          setProfile(profileData)
        } else {
          const errorData = await profileResponse.json()
          setError(errorData.error || "Failed to fetch profile data.")
        }

      } catch (err) {
        setError("Connection failed. Please check if the server is running.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Volunteer Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userName}!
            </p>
          </div>
          <Link href="/volunteer/add-blog">
            <Button>Create Content</Button>
          </Link>
        </div>

        {isLoading && <p>Loading dashboard...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Courses Created</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.coursesCreated}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Articles Written</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.articlesWritten}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Impact Points</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.coursesCreated * 10 + dashboardData.articlesWritten * 5}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex border-b mb-8">
          <button
            className={`py-2 px-4 ${activeTab === "my-courses" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("my-courses")}
          >
            My Courses
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "activity" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "profile" ? "border-b-2 border-primary" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </div>

        <div>
          {activeTab === "my-courses" && (
            <div>
              <div className="flex justify-end mb-4">
                <Link href="/volunteer/add-course">
                  <Button>Create Course</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <img src={course.thumbnail_url || "/placeholder.jpg"} alt={course.title} className="w-full h-40 object-cover rounded-md mb-4" />
                        <CardTitle>{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <Link href={`/volunteer/view-course/${course.id}`}>
                          <Button variant="outline">View</Button>
                        </Link>
                        <Link href={`/volunteer/edit-course/${course.id}`}>
                          <Button>Edit</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No courses created yet.</p>
                )}
              </div>
            </div>
          )}
          {activeTab === "activity" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Recent Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.length === 0 && blogs.length === 0 && (
                  <p>No activity yet. Start creating courses or blogs!</p>
                )}

                {courses.map((item) => (
                  <Card key={`course-${item.id}`}>
                    <CardHeader>
                      <img src={item.thumbnail_url || "/placeholder.jpg"} alt={item.title} className="w-full h-40 object-cover rounded-md mb-4" />
                      <CardTitle>{item.title}</CardTitle>
                      <p className={`text-sm ${item.is_approved ? "text-green-500" : "text-red-500"}`}>
                        {item.is_approved ? "Approved" : "Not Approved"}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/volunteer/view-course/${item.id}`}>
                        <Button variant="outline">View Course</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}

                {blogs.map((item) => (
                  <Card key={`blog-${item.id}`}>
                    <CardHeader>
                      <img src={item.image_url || "/placeholder.jpg"} alt={item.title} className="w-full h-40 object-cover rounded-md mb-4" />
                      <CardTitle>{item.title}</CardTitle>
                      <p className={`text-sm ${item.is_approved ? "text-green-500" : "text-red-500"}`}>
                        {item.is_approved ? "Approved" : "Not Approved"}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {/* Assuming a view blog page exists or will be created */}
                      <Link href={`/volunteer/view-blog/${item.id}`}>
                        <Button variant="outline">View Blog</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Your Profile Information</h2>
              {profile ? (
                <Card>
                  <CardContent className="pt-6">
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
                    <p><strong>Approval Status:</strong> {profile.is_approved ? "Approved" : "Pending/Rejected"}</p>
                    <div className="mt-6">
                      <Link href="/volunteer/edit-profile">
                        <Button>Edit Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p>No profile information available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
