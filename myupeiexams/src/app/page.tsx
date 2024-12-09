'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSession } from 'next-auth/react'

interface Exam {
  _id: string
  courseCode: string
  courseName: string
  examDate: string
  startTime: string
  endTime: string
  location: string
}

export default function Home() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams')
      const data = await response.json()
      setExams(data)
      setFilteredExams(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching exams:', error)
      setIsLoading(false)
    }
  }
const handleLoginOrDashboard = () => {
    if (session?.user?.id) {
      router.push(`/dashboard/${session.user.id}`)
    } else {
      router.push('/login')
    }
  }

  // Handle search
  useEffect(() => {
    const filtered = exams.filter(exam => {
      const searchLower = searchQuery.toLowerCase()
      return exam.courseCode.toLowerCase().includes(searchLower) ||
             exam.courseName.toLowerCase().includes(searchLower)
    })
    setFilteredExams(filtered)
    setCurrentPage(0)  // Reset to first page when searching
  }, [searchQuery, exams])

  // Calculate pagination
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentExams = filteredExams.slice(startIndex, endIndex)

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Login/Dashboard Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">UPEI Exam Schedule</h1>
        <Button 
          onClick={handleLoginOrDashboard}
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {session ? 'Go to Dashboard' : 'Login'}
        </Button>
      </div>

      {!session && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription>
            Login to add courses and view them in your personal dashboard
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by course code or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredExams.length)} of {filteredExams.length} exams
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-3 text-left">Course Code</th>
              <th className="border p-3 text-left">Course Name</th>
              <th className="border p-3 text-left">Date</th>
              <th className="border p-3 text-left">Time</th>
              <th className="border p-3 text-left">Location</th>
            </tr>
          </thead>
          <tbody>
            {currentExams.map((exam) => (
              <tr key={exam._id} className="hover:bg-gray-50">
                <td className="border p-3">{exam.courseCode}</td>
                <td className="border p-3">{exam.courseName}</td>
                <td className="border p-3">{formatDate(exam.examDate)}</td>
                <td className="border p-3">{`${exam.startTime} - ${exam.endTime}`}</td>
                <td className="border p-3">{exam.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          variant="outline"
        >
          Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPage + 1} of {totalPages}
        </span>

        <Button
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage >= totalPages - 1}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  )
}