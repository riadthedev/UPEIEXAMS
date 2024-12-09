import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/auth'
import dbConnect from '@/lib/mongodb'
import UserExam from '@/models/user-exam'
import Exam from '@/models/exam'

type RouteParams = {
  params: Promise<{
    id: string;
  }>
}
export async function GET(
  request: Request,
  context: RouteParams
) {
  const { id } = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await dbConnect()
    const userExams = await UserExam.find({ userId: id }).populate('examId')
    return NextResponse.json(userExams)
  } catch (error) {
    console.error('Error fetching user exams:', error)
    return NextResponse.json({ error: 'Error fetching user exams' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { examId } = await request.json()
    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 })
    }

    await dbConnect()
    const examExists = await Exam.findById(examId)
    if (!examExists) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    const userExam = await UserExam.create({ userId: id, examId })
    return NextResponse.json(userExam, { status: 201 })
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Exam already added to dashboard' }, { status: 400 })
    }
    console.error('Error adding exam:', error)
    return NextResponse.json({ error: 'Error adding exam' }, { status: 500 })
  }
}