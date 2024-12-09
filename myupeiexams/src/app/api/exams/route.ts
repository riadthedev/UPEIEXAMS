import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Exam from '@/models/exam';

export async function GET() {
  try {
    await dbConnect();
    const exams = await Exam.find({}).sort({ examDate: 1, startTime: 1 });
    return NextResponse.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Error fetching exams' },
      { status: 500 }
    );
  }
}