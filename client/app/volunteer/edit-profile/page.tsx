
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface VolunteerProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  is_approved: boolean;
}

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    const volunteer_id = localStorage.getItem("volunteer_id")
    if (!volunteer_id) {
      setError("Volunteer ID not found. Please log in again.")
      setIsLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/volunteer/profile/${volunteer_id}`)
        if (response.ok) {
          const data: VolunteerProfile = await response.json()
          setProfile(data)
          setName(data.name)
          setEmail(data.email)
          setPhone(data.phone || "")
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to fetch profile details.")
        }
      } catch (err) {
        setError("Connection failed. Please check if the server is running.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const volunteer_id = localStorage.getItem("volunteer_id")
    if (!volunteer_id) {
      setError("Volunteer ID not found. Please log in again.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/volunteer/profile/${volunteer_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
        }),
      })

      if (response.ok) {
        // Update local storage if name changed
        if (name !== localStorage.getItem("userName")) {
          localStorage.setItem("userName", name)
        }
        router.push("/volunteer/dashboard?tab=profile")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update profile.")
      }
    } catch (err) {
      setError("Connection failed. Please check if the server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !profile) return <p>Loading profile...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!profile && !isLoading) return <p>Profile not found.</p>

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-2">
              Phone (Optional)
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>Update Profile</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
