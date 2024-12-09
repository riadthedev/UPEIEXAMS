import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/auth'
import dbConnect from '@/lib/mongodb'
import UserExam from '@/models/user-exam'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; examID: string } }
) {
  const { id, examID } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await dbConnect()

    // Log the query parameters
    console.log('Delete request params:', {
      userId: id,
      examId: examID
    })

    // First, let's find the document to see if it exists
    const existingDoc = await UserExam.findOne({
      userId: id,
      _id: examID
    })
    console.log('Existing document:', existingDoc)

    // If no document found, let's see what documents exist for this user
    if (!existingDoc) {
      const userDocs = await UserExam.find({ userId: id })
      console.log('All user documents:', userDocs)
    }

    const result = await UserExam.findOneAndDelete({
      userId: id,
      _id: examID
    })

    if (!result) {
      console.log("No document found to delete")
      return NextResponse.json(
        { error: 'Exam not found in dashboard' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing exam:', error)
    return NextResponse.json(
      { error: 'Error removing exam' },
      { status: 500 }
    )
  }
}