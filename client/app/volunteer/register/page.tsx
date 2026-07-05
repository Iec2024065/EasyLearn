"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const VolunteerRegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    experience: "",
    interests: [] as string[],
    availability: "",
    motivation: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const interestsList = ["Education", "Healthcare", "Community Service", "Technology"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interests: checked
        ? [...prev.interests, interest]
        : prev.interests.filter((i) => i !== interest),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Password check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    // Required fields check
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/volunteer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          initial_comment: formData.motivation,
          experience: formData.experience,
          interests: formData.interests,
          availability: formData.availability,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setError(data.error || "Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
        <p>Thank you for registering as a volunteer. We’ll be in touch soon.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Volunteer Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <Input
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        <Input
          placeholder="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Input
          placeholder="Phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Input
          placeholder="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Input
          placeholder="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Textarea
          placeholder="Previous Experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <div>
          <Label className="mb-2 block">Areas of Interest</Label>
          <div className="grid grid-cols-2 gap-2">
            {interestsList.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={interest}
                  checked={formData.interests.includes(interest)}
                  onCheckedChange={(checked) =>
                    handleInterestChange(interest, checked === true)
                  }
                  disabled={isSubmitting}
                />
                <label htmlFor={interest}>{interest}</label>
              </div>
            ))}
          </div>
        </div>
        <Input
          placeholder="Availability"
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <Textarea
          placeholder="Motivation / Initial Comment"
          name="motivation"
          value={formData.motivation}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Register"}
        </Button>
      </form>
    </div>
  )
}

export default VolunteerRegisterPage
