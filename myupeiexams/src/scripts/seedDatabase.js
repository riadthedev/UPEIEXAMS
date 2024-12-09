// src/scripts/seedDatabase.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Load the exam data
const examData = require('../data/examData');

// Define the schema here since we're using plain JavaScript
const examSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  examDate: Date,
  startTime: String,
  endTime: String,
  location: String
}, {
  timestamps: true
});

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create the model
    const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);

    // Clear existing exams
    await Exam.deleteMany({});
    console.log('Cleared existing exams');

    // Process the dates to convert strings to Date objects
    const processedExams = examData.map(exam => {
      // Parse the date (format: "Oct-01-2024")
      const [month, day, year] = exam.examDate.split('-');
      const dateStr = `${month} ${day} ${year}`;
      
      return {
        ...exam,
        examDate: new Date(dateStr)
      };
    });

    // Insert the exams
    const result = await Exam.insertMany(processedExams);
    console.log(`Successfully inserted ${result.length} exams`);

    // Log a sample exam
    console.log('\nSample exam in database:', result[0]);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeder
console.log('Starting database seeding...');
seedDatabase();