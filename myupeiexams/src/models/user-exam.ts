import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';

export interface IUserExam extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  addedAt: Date;
}

const userExamSchema = new Schema<IUserExam>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to prevent a user from adding the same exam twice
userExamSchema.index({ userId: 1, examId: 1 }, { unique: true });

const UserExam = models.UserExam || model<IUserExam>('UserExam', userExamSchema);
export default UserExam;