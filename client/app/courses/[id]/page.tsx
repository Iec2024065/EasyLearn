// "use client"

// import { useEffect, useState } from "react"
// import { useParams } from "next/navigation"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import Image from "next/image"

// interface Course {
//   id: number
//   title: string
//   courseDescription: string
//   rating: number
//   thumbnailUrl: string
//   videoUrl?: string
//   content: string
//   createdAt: string
// }

// export default function CourseDetailPage() {
//   const { id } = useParams()
//   const [course, setCourse] = useState<Course | null>(null)

//   useEffect(() => {
//     if (id) {
//       fetch(`http://localhost:5000/course/public/${id}`)
//         .then((res) => res.json())
//         .then((data) => setCourse(data))
//         .catch((err) => console.error("Error fetching course:", err))
//     }
//   }, [id])

//   console.log("Course data:", course)

//   if (!course) {
//     return <div className="p-8">Loading...</div>
//   }

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       {/* Title */}
//       <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

//       {/* Thumbnail */}
//       {course.thumbnailUrl && (
//         <div className="mb-6">
//           <Image
//             src={course.thumbnailUrl}
//             alt={course.title}
//             width={800}
//             height={400}
//             className="rounded-lg shadow-lg object-cover"
//           />
//         </div>
//       )}

//       {/* Video Player */}
//       {course.videoUrl && (
//         <div className="mb-8">
//           <div className="aspect-video bg-muted rounded-lg overflow-hidden">
//             {course.videoUrl.includes("youtube.com") || course.videoUrl.includes("youtu.be") ? (
//               // YouTube
//               <iframe
//                 src={
//                   course.videoUrl.includes("watch?v=")
//                     ? course.videoUrl.replace("watch?v=", "embed/")
//                     : course.videoUrl.replace("youtu.be/", "www.youtube.com/embed/")
//                 }
//                 title={course.title}
//                 className="w-full h-full"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//               />
//             ) : course.videoUrl.includes("vimeo.com") ? (
//               // Vimeo
//               <iframe
//                 src={course.videoUrl.replace("vimeo.com", "player.vimeo.com/video")}
//                 title={course.title}
//                 className="w-full h-full"
//                 allow="autoplay; fullscreen; picture-in-picture"
//                 allowFullScreen
//               />
//             ) : (
//               // Direct MP4 or other
//               <video controls className="w-full h-full">
//                 <source src={course.videoUrl} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Course Content */}
//       <Card className="mb-6">
//         <CardContent className="p-6">
//           <h2 className="text-2xl font-semibold mb-2">Course Content</h2>
//           <div
//             className="prose max-w-none"
//             dangerouslySetInnerHTML={{ __html: course.content }}
//           />
//         </CardContent>
//       </Card>

//       {/* Rating */}
//       <div className="flex items-center mb-6">
//         <span className="text-yellow-500 text-xl mr-2">★</span>
//         <span className="font-medium">{course.rating}/5</span>
//       </div>

     
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Course {
  id: number
  title: string
  description: string
  rating: number
  thumbnail: string
  video_url?: string
  content?: string
  duration: string
  students: number
  level: string
  category: string
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/course/public/${id}`)
        .then((res) => res.json())
        .then((data) => {
          // Map backend fields to frontend fields if needed
          console.log("Course data from backend:", data);
          setCourse({
            id: data.id,
            title: data.title,
            description: data.description || "",
            thumbnail: data.thumbnail || "/placeholder.svg",
            rating: data.rating || 0,
            duration: data.duration || "N/A",
            students: data.students || 0,
            level: data.level || "N/A",
            category: data.category || "N/A",
            content: data.content || "", // fallback for now
            video_url: data.video_url || undefined,
          })
        })
        .catch((err) => console.error("Error fetching course:", err))
        
    }
  }, [id])

  if (!course) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

      {course.thumbnail && (
        <div className="mb-6">
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={800}
            height={400}
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      )}
        
      {course.video_url && (
        <div className="mb-8">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {course.video_url.includes("youtube.com") || course.video_url.includes("youtu.be") ? (
              <iframe
                src={
                  course.video_url.includes("watch?v=")
                    ? course.video_url.replace("watch?v=", "embed/")
                    : course.video_url.replace("youtu.be/", "www.youtube.com/embed/")
                }
                title={course.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : course.video_url.includes("vimeo.com") ? (
              <iframe
                src={course.video_url.replace("vimeo.com", "player.vimeo.com/video")}
                title={course.title}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls className="w-full h-full">
                <source src={course.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}

      {/* <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Course Content</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: course.content }}
          />
        </CardContent>
      </Card> */}

      {course.content && (
  <Card className="mb-6">
    <CardContent className="p-6">
      <h2 className="text-2xl font-semibold mb-2">Course Content</h2>
      <div
        className="prose max-w-none whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: course.content }}
      />
    </CardContent>
  </Card>
)}

      <div className="flex items-center mb-6">
        <span className="text-yellow-500 text-xl mr-2">★</span>
        <span className="font-medium">{course.rating}/5</span>
      </div>
    </div>
  )
}
