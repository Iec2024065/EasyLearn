
// "use client"

// import { useEffect, useState } from "react"
// import { useParams } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export default function ContentPreviewPage() {
//   const params = useParams()
//   const { contentType, id } = params
//   const [content, setContent] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     if (!contentType || !id) return

//     const fetchContent = async () => {
//       setIsLoading(true)
//       setError("")
//       try {
//         const response = await fetch(`http://127.0.0.1:5000/employee/${contentType}/${id}`)
//         console.log(response) 
//         const data = await response.json()
//         console.log(data)
//         if (response.ok) {
//           setContent(data)

//         } else {
//           setError(data.error || "Failed to fetch content")
//         }
//       } catch (error) {
//         setError("Failed to fetch content")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchContent()
//   }, [contentType, id])

//   if (isLoading) {
//     return <div>Loading...</div>
//   }

//   if (error) {
//     return <div>Error: {error}</div>
//   }

//   if (!content) {
//     return <div>Content not found</div>
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold">{content.title}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {contentType === 'course' && (
//               <div>
//                 <p className="text-muted-foreground">{content.course_description}</p>
//                 {content.video_url && (
//                   <div className="aspect-w-16 aspect-h-9 mt-4">
//                     <iframe
//                       src={content.video_url}
//                       title={content.title}
//                       frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                       className="w-full h-full"
//                     ></iframe>
//                   </div>
//                 )}
//                 <div className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: content.content }} />
//               </div>
//             )}
            // {{contentType === 'blog' && (
            //   <div>
            //     {content.thumbnail_url && <img src={content.thumbnail_url} alt={content.imageAlt || content.title} className="w-full h-auto object-cover rounded-md mb-4" />}
            //     <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
            //   </div>
            // )}}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContentPreviewPage() {
  const params = useParams()
  const { contentType, id } = params
  const [content, setContent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // ✅ Utility to convert normal or short YouTube URLs into embeddable ones
  const getEmbedUrl = (url) => {
    if (!url) return ""
    // handle youtu.be short links
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // handle normal youtube.com/watch?v= links
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // fallback (in case already embed)
    return url
  }

  useEffect(() => {
    if (!contentType || !id) return

    const fetchContent = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch(`http://127.0.0.1:5000/employee/${contentType}/${id}`)
        const data = await response.json()
      
        console.log("data", data)
        if (response.ok) {
          setContent(data)
          console.log(content)
        } else {
          setError(data.error || "Failed to fetch content")
        }
      } catch (error) {
        setError("Failed to fetch content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [contentType, id])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!content) return <div>Content not found</div>

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{content.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {contentType === "course" && (
              <div>
                <p className="text-muted-foreground">{content.course_description}</p>

                {content.video_url && (
                  // <div className="aspect-w-16 aspect-h-9 mt-4">
                  //   <iframe
                  //     src={getEmbedUrl(content.video_url)} // ✅ fixed URL here
                  //     title={content.title}
                  //     frameBorder="0"
                  //     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  //     allowFullScreen
                  //     className="w-full h-full"
                  //   ></iframe>
                  // </div>

                  <div className="relative w-full mt-4" style={{ paddingTop: "56.25%" }}>
                    <iframe
                      src={getEmbedUrl(content.video_url)}
                      title={content.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                    ></iframe>
                  </div>

                  
                )}

                <div
                  className="prose max-w-none mt-4 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            )}
            
            {contentType === "blog" && (
              <div>
                {content.thumbnail && (
                  <img
                    src={content.thumbnail}
                    alt={content.thumbnail || content.title}
                    className="w-full h-auto object-cover rounded-md mb-4"
                  />
                )}
                <div
                  className="prose max-w-none mt-4 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
