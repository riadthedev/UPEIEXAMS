'use client'

import React, { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MinusCircle, Search, Clock } from 'lucide-react'
import { Input } from "@/components/ui/input"

interface Exam {
  _id: string
  courseCode: string
  courseName: string
  examDate: string
  startTime: string
  endTime: string
  location: string
}

interface UserExam {
  _id: string
  examId: Exam
}
type Props = {
  params: Promise<{ 
    id: string;
    examID?: string;  // The ? makes it optional
  }>
}
export default function DashboardPage({ params }:Props) {
  const {id} = use(params);
  const { data: session } = useSession()
  const router = useRouter()
  const [allExams, setAllExams] = useState<Exam[]>([])
  const [userExams, setUserExams] = useState<UserExam[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-courses')


  useEffect(() => {
    // Verify the user is logged in and accessing their own dashboard
    if (!session) {
      router.push('/login')
      return
    }

    if (session?.user?.id !== id) {   
      router.push(`/dashboard/${id}`)
      return
    }

    if (id) {
      fetchAllExams()
      fetchUserExams()
    }
  }, [session, id])

  const fetchAllExams = async () => {
    try {
      const response = await fetch('/api/exams')
      const data = await response.json()
      setAllExams(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching exams:', error)
      setIsLoading(false)
    }
  }

  const fetchUserExams = async () => {
    try {
      const response = await fetch(`/api/exams/users/${id}/exam`)
      const data = await response.json()
      setUserExams(data)
    } catch (error) {
      console.error('Error fetching user exams:', error)
    }
  }
  const addExam = async (examId: string) => {
    try {
      const response = await fetch(`/api/exams/users/${id}/exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId })
      });
      if (response.ok) {
        await fetchUserExams(); // Refresh the user's exams
      }
    } catch (error) {
      console.error('Error adding exam:', error);
    }
  };

  const removeExam = async (examID: string) => {
    console.log('Trying to remove exam:',examID);
    try {
      const response = await fetch(`/api/exams/users/${id}/exam/${examID}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchUserExams(); // Refresh the user's exams
      }
    } catch (error) {
      console.error('Error removing exam:', error);
    }
  };

  const getCountdown = (examDate: string, startTime: string) => {
    const [hours, minutes] = startTime.split(':');
    const examDateTime = new Date(examDate);
    examDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    const diff = examDateTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Exam has passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${remainingHours} hours`;
  };

  // Filter exams based on search query
  const filteredExams = allExams.filter(exam => {
    const search = searchQuery.toLowerCase();
    return exam.courseCode.toLowerCase().includes(search) ||
           exam.courseName.toLowerCase().includes(search);
  });

  // Get set of user's exam IDs for checking if an exam is already added
  const userExamIds = new Set(userExams.map(ue => ue.examId._id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="my-courses">My Courses</TabsTrigger>
        <TabsTrigger value="all-courses">All Courses</TabsTrigger>
      </TabsList>

      <TabsContent value="my-courses">
        {userExams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">You haven't added any courses to your dashboard yet.</p>
            <Button 
              onClick={() => setActiveTab('all-courses')}
            >
              View All Courses
            </Button>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userExams.map(({ examId: exam, _id },{}) => (
                <Card key={_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exam.courseCode}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExam(_id.toString())}
                      >
                        <MinusCircle className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{exam.courseName}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(exam.examDate).toLocaleDateString()} at {exam.startTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Location: {exam.location}</p>
                      <p className="text-sm font-semibold text-indigo-600">
                        Countdown: {getCountdown(exam.examDate, exam.startTime)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all-courses">
          <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left">Course</th>
                  <th className="border p-3 text-left">Date & Time</th>
                  <th className="border p-3 text-left">Location</th>
                  <th className="border p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="border p-3">
                      <div className="font-medium">{exam.courseCode}</div>
                      <div className="text-sm text-gray-600">{exam.courseName}</div>
                    </td>
                    <td className="border p-3">
                      {new Date(exam.examDate).toLocaleDateString()}
                      <br />
                      {exam.startTime} - {exam.endTime}
                    </td>
                    <td className="border p-3">{exam.location}</td>
                    <td className="border p-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => userExamIds.has(exam._id) 
                          ? removeExam(exam._id) 
                          : addExam(exam._id)}
                      >
                        {userExamIds.has(exam._id) ? (
                          <MinusCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <PlusCircle className="h-5 w-5 text-green-500" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}