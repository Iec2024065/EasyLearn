

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Shield, Users, Book, MessageSquare, BarChart, Download, Settings, CheckCircle, Clock, AlertTriangle, Search, Filter, PlusCircle } from "lucide-react"

// interface Volunteer {
//   id: number;
//   name: string;
//   email: string;
// }

// interface Content {
//   id: number;
//   title: string;
//   type: 'course' | 'blog';
// }

// export default function EmployeeDashboard() {
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalVolunteers: 0,
//     totalCourses: 0,
//   })
//   const [pendingVolunteers, setPendingVolunteers] = useState<Volunteer[]>([])
//   const [pendingContent, setPendingContent] = useState<Content[]>([])

//   const fetchWithRetry = async (url: string, options = {}, retries = 3, delay = 1000) => {
//     for (let i = 0; i < retries; i++) {
//       try {
//         console.log(`Fetching ${url}, attempt ${i + 1}`);
//         const response = await fetch(url, { ...options, credentials: "include" });
//         if (response.ok) {
//           console.log(`Successfully fetched ${url}`);
//           return response;
//         }
//         console.error(`Attempt ${i + 1} failed for ${url} with status ${response.status}`);
//       } catch (error) {
//         console.error(`Attempt ${i + 1} failed for ${url}`, error);
//       }
//       if (i < retries - 1) {
//         await new Promise(res => setTimeout(res, delay));
//       }
//     }
//     throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await fetchWithRetry("http://127.0.0.1:5000/employee/dashboard/counts");
//       if (response) {
//         const data = await response.json();
//         setStats({
//           totalUsers: data.total_users,
//           totalVolunteers: data.total_volunteers,
//           totalCourses: data.total_courses,
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch dashboard stats:", error);
//     }
//   };

//   useEffect(() => {
//     const fetchPendingVolunteers = async () => {
//       try {
//         const response = await fetchWithRetry("http://127.0.0.1:5000/employee/volunteers/pending");
//         if (response) {
//           const data = await response.json();
//           setPendingVolunteers(data);
//         }
//         console.log(response) ;
//       } catch (error) {
//         console.error("Failed to fetch pending volunteers:", error);
//       }
//     };

//     const fetchPendingContent = async () => {
//       try {
//         const response = await fetchWithRetry("http://127.0.0.1:5000/employee/content/pending");
//         if (response) {
//           const data = await response.json();
//           setPendingContent(data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch pending content:", error);
//       }
//     };

//     fetchStats();
//     fetchPendingVolunteers();
//     fetchPendingContent();
//   }, []);

//   const handleApproveRejectVolunteer = async (volunteerId: number, action: 'approve' | 'reject') => {
//     try {
//       const response = await fetchWithRetry("http://127.0.0.1:5000/employee/volunteers/approve", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ volunteer_id: volunteerId, action }),
//       });
//       if (response && response.ok) {
//         setPendingVolunteers(pendingVolunteers.filter((v) => v.id !== volunteerId));
//         if (action === 'reject') {
//           fetchStats();
//         }
//       }
//     } catch (error) {
//       console.error("Failed to approve/reject volunteer:", error);
//     }
//   };

//   const handleApproveRejectContent = async (contentId: number, contentType: 'course' | 'blog', action: 'approve' | 'reject') => {
//     try {
//       const response = await fetchWithRetry("http://127.0.0.1:5000/employee/content/approve", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ content_id: contentId, content_type: contentType, action }),
//       });
//       if (response && response.ok) {
//         setPendingContent(pendingContent.filter((c) => c.id !== contentId));
//         if (action === 'reject') {
//           fetchStats();
//         }
//       }
//     } catch (error) {
//       console.error("Failed to approve/reject content:", error);
//     }
//   };

"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SupportTab from "@/components/SupportTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Book,
  MessageSquare,
  Filter,
  Search,
  Download,
  Settings,
} from "lucide-react";

interface Volunteer {
  id: number;
  name: string;
  email: string;
}

interface Content {
  id: number;
  title: string;
  type: "course" | "blog";
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolunteers: 0,
    totalCourses: 0,
  });
  const [pendingVolunteers, setPendingVolunteers] = useState<Volunteer[]>([]);
  const [pendingContent, setPendingContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Simplified and corrected fetchWithRetry (no credentials)
  const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    retries = 2,
    delay = 1000
  ): Promise<Response> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) return response;
        console.warn(`Fetch attempt ${attempt + 1} failed for ${url}`);
      } catch (err) {
        console.error(`Fetch error on ${url}:`, err);
      }
      if (attempt < retries - 1) await new Promise((res) => setTimeout(res, delay));
    }
    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
  };

  // ✅ Load dashboard data in sequence
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Step 1: Wait for backend (simple health check)
        const health = await fetch("http://127.0.0.1:5000/");
        if (!health.ok) throw new Error("Backend not reachable");

        // Step 2: Fetch stats
        const statsRes = await fetchWithRetry(
          "http://127.0.0.1:5000/employee/dashboard/counts"
        );
        const statsData = await statsRes.json();
        setStats({
          totalUsers: statsData.total_users || 0,
          totalVolunteers: statsData.total_volunteers || 0,
          totalCourses: statsData.total_courses || 0,
        });

        // Step 3: Fetch pending volunteers
        const volunteersRes = await fetchWithRetry(
          "http://127.0.0.1:5000/employee/volunteers/pending"
        );
        const volunteersData = await volunteersRes.json();
        setPendingVolunteers(volunteersData || []);

        // Step 4: Fetch pending content
        const contentRes = await fetchWithRetry(
          "http://127.0.0.1:5000/employee/content/pending"
        );
        const contentData = await contentRes.json();
        setPendingContent(contentData || []);
      } catch (err: any) {
        setError("Failed to load dashboard. Please check backend server.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleApproveRejectVolunteer = async (
    volunteerId: number,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetchWithRetry(
        "http://127.0.0.1:5000/employee/volunteers/approve",
        {
          method: "POST",
          body: JSON.stringify({ volunteer_id: volunteerId, action }),
        }
      );
      if (response.ok) {
        setPendingVolunteers((prev) =>
          prev.filter((v) => v.id !== volunteerId)
        );
      }
    } catch (err) {
      console.error("Volunteer approval failed:", err);
    }
  };

  const handleApproveRejectContent = async (
    contentId: number,
    contentType: "course" | "blog",
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetchWithRetry(
        "http://127.0.0.1:5000/employee/content/approve",
        {
          method: "POST",
          body: JSON.stringify({
            content_id: contentId,
            content_type: contentType,
            action,
          }),
        }
      );
      if (response.ok) {
        setPendingContent((prev) => prev.filter((c) => c.id !== contentId));
      }
    } catch (err) {
      console.error("Content approval failed:", err);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage platform operations and content</p>
            </div>
          </div>
          {/* <div className="flex items-center gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+15.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
              <p className="text-xs text-muted-foreground">{pendingVolunteers.length} pending approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">{pendingContent.filter(c => c.type === 'course').length} pending review</p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 high priority</p>
            </CardContent>
          </Card> */}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* This will be dynamic later */}
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">John Doe approved a new blog post</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        R
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Riya added a new finance course</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-semibold">
                        M
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mohit updated volunteer information</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        S
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sneha write a blog post</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start">Review Volunteer Applications ({pendingVolunteers.length})</Button>
                    <Button variant="secondary" className="w-full justify-start">Review Pending Content ({pendingContent.length})</Button>
                    <Button variant="ghost" className="w-full justify-start">Handle Support Tickets </Button>
                    {/* <Button variant="ghost" className="w-full justify-start">View Analytics Report</Button> */}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Volunteer Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search volunteers..." className="pl-8" />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Pending Applications ({pendingVolunteers.length})</h3>
                <div className="space-y-4">
                  {pendingVolunteers.map((volunteer) => (
                    <Card key={volunteer.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-muted rounded-full h-10 w-10 flex items-center justify-center font-bold">
                            {volunteer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{volunteer.name}</p>
                            <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleApproveRejectVolunteer(volunteer.id, 'reject')}>Reject</Button>
                          <Button onClick={() => handleApproveRejectVolunteer(volunteer.id, 'approve')}>Approve</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Management</CardTitle>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Pending Content Review ({pendingContent.length})</h3>
                <div className="space-y-4">
                  {pendingContent.map((content) => (
                    <Card key={content.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Book className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{content.title}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${content.type === 'course' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {content.type.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/employee/preview/${content.type}/${content.id}`} passHref>
                            <Button variant="outline">Preview</Button>
                          </Link>
                          <Button variant="outline" onClick={() => handleApproveRejectContent(content.id, content.type, 'reject')}>Reject</Button>
                          <Button onClick={() => handleApproveRejectContent(content.id, content.type, 'approve')}>Approve</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Queries</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage user-submitted queries and mark them resolved once addressed.
                  </p>
                </CardHeader>

                <CardContent>
                  <SupportTab />
                </CardContent>
              </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
