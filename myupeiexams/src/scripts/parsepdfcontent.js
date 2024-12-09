const fs = require('fs');
const path = require('path');

function parseExamSchedule() {
  try {
    // Log the current working directory
    console.log('Current directory:', process.cwd());
    
    const inputPath = path.join(process.cwd(), 'input.txt');
    console.log('Looking for input file at:', inputPath);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('Input file not found at:', inputPath);
      return;
    }

    // Read the input file
    const content = fs.readFileSync(inputPath, 'utf8');
    console.log('Successfully read input file');

    // Split into lines and filter out headers and empty lines
    const lines = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && 
             !trimmed.startsWith('Generated') &&
             !trimmed.startsWith('2024 Fall') &&
             !trimmed.startsWith('Exam Schedule') &&
             !trimmed.startsWith('Section Title') &&
             !trimmed.match(/^(Start|End|Time|Location)$/);
    });

    const examEntries = [];
    let currentEntry = '';

    // Process each line
    lines.forEach(line => {
      // Check if line starts with a course code
      if (line.match(/^[A-Z]+-\d+[A-Z]*-\d+/)) {
        if (currentEntry) {
          const entry = processEntry(currentEntry);
          if (entry) examEntries.push(entry);
        }
        currentEntry = line;
      } else if (currentEntry) {
        currentEntry += ' ' + line;
      }
    });

    // Process the last entry
    if (currentEntry) {
      const entry = processEntry(currentEntry);
      if (entry) examEntries.push(entry);
    }

    console.log(`Processed ${examEntries.length} exam entries`);
    console.log('Sample entry:', examEntries[0]);

    // Convert to a module export format
    const outputContent = `// Generated from exam schedule
module.exports = ${JSON.stringify(examEntries, null, 2)};
`;

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('Created output directory:', outputDir);
    }

    // Write to output file
    const outputPath = path.join(outputDir, 'examData.js');
    fs.writeFileSync(outputPath, outputContent);
    console.log('Output written to:', outputPath);

  } catch (error) {
    console.error('Error processing file:', error);
  }
}

function processEntry(line) {
  try {
    const parts = line.trim().split(/\s+/);
    
    // We know the date is always in format XXX-XX-XXXX
    let dateIndex = parts.findIndex(part => part.match(/[A-Za-z]+-\d{2}-\d{4}/));
    
    // Extract basic components
    const courseCode = parts[0];
    const courseName = parts.slice(1, dateIndex).join(' ');
    const examDate = parts[dateIndex];
    
    // Time and location parsing
    const startTime = parts[dateIndex + 1] + ' ' + parts[dateIndex + 2]; // e.g., "07:00 PM"
    const endTime = parts[dateIndex + 3] + ' ' + parts[dateIndex + 4];   // e.g., "10:00 PM"
    
    // Location will be all remaining parts joined together
    const location = parts.slice(dateIndex + 5).join(' ');

    return {
      courseCode,
      courseName,
      examDate,
      startTime,
      endTime,
      location
    };
  } catch (error) {
    console.warn('Error processing line:', line);
    console.error('Error details:', error);
    return null;
  }
}

// Run the parser
console.log('Starting exam schedule parser...');
parseExamSchedule();