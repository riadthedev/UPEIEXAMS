import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';

export interface IExam extends mongoose.Document {
  courseCode: string;
  courseName: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  location: string;
}

const examSchema = new Schema<IExam>({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    trim: true
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  }
}, {
  timestamps: true
});

const Exam = models.Exam || model<IExam>('Exam', examSchema);
export default Exam;