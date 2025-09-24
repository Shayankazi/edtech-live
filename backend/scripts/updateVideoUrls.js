const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Course = require('../models/Course');

async function updateVideoUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/virtual_learning_platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all video files
    const videosDir = path.join(__dirname, '../../videos');
    const videoFiles = fs.readdirSync(videosDir).filter(file => file.endsWith('.mp4'));
    console.log(`📹 Found ${videoFiles.length} video files:`, videoFiles);

    // Get all courses
    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses`);

    let updateCount = 0;

    for (const course of courses) {
      let courseUpdated = false;
      
      for (const section of course.sections) {
        for (let i = 0; i < section.lessons.length; i++) {
          const lesson = section.lessons[i];
          
          // If lesson doesn't have video URL but we have videos available
          if ((!lesson.videoUrl || lesson.videoUrl === '') && (!lesson.content || lesson.content === null) && videoFiles.length > 0) {
            // Assign the first available video (you can modify this logic)
            const videoFile = videoFiles[updateCount % videoFiles.length];
            const videoUrl = `/videos/${videoFile}`;
            
            lesson.videoUrl = videoUrl;
            lesson.content = videoUrl;
            
            console.log(`🔗 Updated lesson "${lesson.title}" with video: ${videoUrl}`);
            courseUpdated = true;
            updateCount++;
          }
        }
      }
      
      if (courseUpdated) {
        await course.save();
        console.log(`💾 Saved course: ${course.title}`);
      }
    }

    console.log(`✅ Updated ${updateCount} lessons with video URLs`);
    
  } catch (error) {
    console.error('❌ Error updating video URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

updateVideoUrls();
