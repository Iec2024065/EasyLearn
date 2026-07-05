// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Menu, X, GraduationCap } from "lucide-react"

// export function Navbar() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [userName, setUserName] = useState("")

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("authToken");
//       const name = localStorage.getItem("userName");
//       if (token) {
//         setIsLoggedIn(true);
//         if (name) {
//           setUserName(name);
//         }
//       } else {
//         setIsLoggedIn(false);
//         setUserName("");
//       }
//     };

//     checkAuth();

//     window.addEventListener("storage", checkAuth);

//     return () => {
//       window.removeEventListener("storage", checkAuth);
//     };
//   }, []);

//   const handleLogout = async () => {
//     const userType = localStorage.getItem("userType");
//     let logoutUrl = "";

//     if (userType === "user") {
//       logoutUrl = "http://127.0.0.1:5000/api/user/logout";
//     } else if (userType === "employee") {
//       logoutUrl = "http://127.0.0.1:5000/employee/logout";
//     } else if (userType === "volunteer") {
//       logoutUrl = "http://127.0.0.1:5000/volunteer/logout";
//     }

//     if (!logoutUrl) {
//       console.error("Invalid user type for logout");
//       return;
//     }

//     try {
//       const response = await fetch(logoutUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       });

//       if (response.ok) {
//         localStorage.removeItem("authToken");
//         localStorage.removeItem("userType");
//         localStorage.removeItem("userName");
//         localStorage.removeItem("volunteer_id");
//         setIsLoggedIn(false);
//         setUserName("");
//         window.location.href = "/";
//       } else {
//         console.error("Logout failed");
//       }
//     } catch (error) {
//       console.error("Logout failed", error);
//     }
//   };

//   const navItems = [
//     { href: "/", label: "Home" },
//     { href: "/courses", label: "Courses" },
//     { href: "/tools", label: "Tools" },
//     { href: "/blog", label: "Blog" },
//     { href: "/quiz", label: "Quiz" },
//     { href: "/volunteer", label: "Volunteer" },
//   ]

//   return (
//     <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
//             <GraduationCap className="h-8 w-8" />
//             <span className="text-balance">EasyLearn</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center gap-8">
//             {navItems.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="text-foreground hover:text-primary transition-colors font-medium"
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           {/* Desktop Auth Buttons */}
//           <div className="hidden md:flex items-center gap-4">
//             {isLoggedIn ? (
//               <>
//                 <span className="text-foreground font-medium">Welcome, {userName}</span>
//                 <Button variant="ghost" onClick={handleLogout} className="text-foreground hover:text-primary">
//                   Logout
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Link href="/login">
//                   <Button variant="ghost" className="text-foreground hover:text-primary">
//                     Login
//                   </Button>
//                 </Link>
//                 <Link href="/register">
//                   <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
//                 </Link>
//               </>
//             )}
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
//               {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </Button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isOpen && (
//           <div className="md:hidden">
//             <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   {item.label}
//                 </Link>
//               ))}
//               <div className="flex flex-col gap-2 px-3 pt-4">
//                 {isLoggedIn ? (
//                   <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
//                     Logout
//                   </Button>
//                 ) : (
//                   <>
//                     <Link href="/login" onClick={() => setIsOpen(false)}>
//                       <Button variant="outline" className="w-full bg-transparent">
//                         Login
//                       </Button>
//                     </Link>
//                     <Link href="/register" onClick={() => setIsOpen(false)}>
//                       <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
//                     </Link>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   )
// }



"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, GraduationCap } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [userType, setUserType] = useState("") // 👈 Added for redirecting to proper dashboard

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const name = localStorage.getItem("userName");
      const type = localStorage.getItem("userType"); // 👈 fetch user type
      if (token) {
        setIsLoggedIn(true);
        if (name) setUserName(name);
        if (type) setUserType(type);
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserType("");
      }
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = async () => {
    const userType = localStorage.getItem("userType");
    let logoutUrl = "";

    if (userType === "user") {
      logoutUrl = "http://127.0.0.1:5000/api/user/logout";
    } else if (userType === "employee") {
      logoutUrl = "http://127.0.0.1:5000/employee/logout";
    } else if (userType === "volunteer") {
      logoutUrl = "http://127.0.0.1:5000/volunteer/logout";
    }

    if (!logoutUrl) {
      console.error("Invalid user type for logout");
      return;
    }

    try {
      const response = await fetch(logoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userName");
        localStorage.removeItem("volunteer_id");
        setIsLoggedIn(false);
        setUserName("");
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // 👇 Navigation items
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/tools", label: "Tools" },
    { href: "/blog", label: "Blog" },
    { href: "/quiz", label: "Quiz" },
    { href: "/volunteer", label: "Volunteer" },
  ]

  // 👇 Function to redirect to respective dashboard
  const handleDashboardRedirect = () => {
    if (userType === "employee") {
      window.location.href = "/employee/dashboard";
    } else if (userType === "volunteer") {
      window.location.href = "/volunteer/dashboard";
    } else if (userType === "user") {
      window.location.href = "/user/dashboard";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <GraduationCap className="h-8 w-8" />
            <span className="text-balance">EasyLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-foreground font-medium">Welcome, {userName}</span>

                {/* 👇 Added Back to Dashboard button */}
                <Button
                  variant="outline"
                  onClick={handleDashboardRedirect}
                  className="text-foreground hover:text-primary"
                >
                  Back to Dashboard
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-foreground hover:text-primary"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-foreground hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* 👇 Added Back to Dashboard for mobile */}
              {isLoggedIn && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDashboardRedirect();
                    setIsOpen(false);
                  }}
                  className="w-full bg-transparent mt-2"
                >
                  Back to Dashboard
                </Button>
              )}

              <div className="flex flex-col gap-2 px-3 pt-4">
                {isLoggedIn ? (
                  <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
