// src/models/user.ts
import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  id: string;  // Virtual getter for _id as string
  email: string;
  name: string;
  password: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  image: String
}, {
  timestamps: true
});

// Add virtual getter for id
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included when converting document to JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(_, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

const User = models.User || model<IUser>('User', userSchema);
export default User;