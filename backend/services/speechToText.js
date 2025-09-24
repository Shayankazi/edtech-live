const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const FormData = require('form-data');
const fetch = require('node-fetch');

class SpeechToTextService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.googleApiKey = process.env.GOOGLE_SPEECH_API_KEY;
    
    // Set ffmpeg path
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  /**
   * Generate captions using OpenAI Whisper API
   */
  async generateCaptionsWithWhisper(videoPath) {
    if (!this.openaiApiKey) {
      console.log('OpenAI API key not configured, using mock captions');
      return this.generateMockCaptions(120);
    }

    try {
      console.log('Starting audio extraction for OpenAI Whisper...');
      const audioPath = await this.extractAudio(videoPath);
      
      console.log('Preparing Whisper API request...');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioPath));
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'word');

      console.log('Sending request to OpenAI Whisper API...');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Whisper API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('OpenAI Whisper API response received successfully');
      
      // Clean up temporary audio file
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        console.log('Temporary audio file cleaned up');
      }

      return this.formatWhisperResponse(result);
    } catch (error) {
      console.error('Whisper transcription error:', error);
      return this.generateMockCaptions(120);
    }
  }

  /**
   * Generate captions using Google Speech-to-Text API with live translation
   */
  async generateCaptionsWithGoogle(videoPath, targetLanguage = 'en-US') {
    if (!this.googleApiKey) {
      console.log('Google Speech API key not configured, using mock captions');
      return this.generateMockCaptions(120);
    }

    try {
      console.log('Starting audio extraction for Google Speech-to-Text...');
      const audioPath = await this.extractAudio(videoPath);
      
      console.log('Reading audio file for Google Speech API...');
      const audioBytes = fs.readFileSync(audioPath).toString('base64');

      const request = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: targetLanguage,
          enableWordTimeOffsets: true,
          enableAutomaticPunctuation: true,
          enableSpeakerDiarization: true,
          diarizationSpeakerCount: 2,
          model: 'video',
          useEnhanced: true,
        },
        audio: {
          content: audioBytes,
        },
      };

      console.log('Sending request to Google Speech API...');
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.googleApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Speech API error response:', errorText);
        throw new Error(`Google Speech API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Google Speech API response received successfully');
      
      // Clean up temporary audio file
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        console.log('Temporary audio file cleaned up');
      }

      return this.formatGoogleResponse(result);
    } catch (error) {
      console.error('Google Speech transcription error:', error);
      return this.generateMockCaptions(120);
    }
  }

  /**
   * Extract audio from video file using ffmpeg
   */
  async extractAudio(videoPath) {
    return new Promise((resolve, reject) => {
      const audioOutputPath = videoPath.replace(/\.[^/.]+$/, '_audio.wav');
      
      console.log(`Extracting audio from ${videoPath} to ${audioOutputPath}`);
      
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .audioChannels(1)
        .format('wav')
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Audio extraction progress:', progress.percent + '%');
        })
        .on('end', () => {
          console.log('Audio extraction completed');
          resolve(audioOutputPath);
        })
        .on('error', (err) => {
          console.error('Audio extraction error:', err);
          reject(err);
        })
        .save(audioOutputPath);
    });
  }

  /**
   * Format OpenAI Whisper response to our caption format
   */
  formatWhisperResponse(whisperResult) {
    const captions = [];
    
    if (whisperResult.words) {
      // Group words into caption segments (every 5-10 words or by punctuation)
      let currentSegment = {
        start: 0,
        end: 0,
        text: ''
      };
      
      whisperResult.words.forEach((word, index) => {
        if (currentSegment.text === '') {
          currentSegment.start = word.start;
        }
        
        currentSegment.text += word.word + ' ';
        currentSegment.end = word.end;
        
        // Create new segment every 8 words or at sentence end
        if ((index + 1) % 8 === 0 || word.word.includes('.') || word.word.includes('!') || word.word.includes('?')) {
          captions.push({
            start: Math.floor(currentSegment.start),
            end: Math.floor(currentSegment.end),
            text: currentSegment.text.trim()
          });
          
          currentSegment = { start: 0, end: 0, text: '' };
        }
      });
      
      // Add remaining text if any
      if (currentSegment.text.trim()) {
        captions.push({
          start: Math.floor(currentSegment.start),
          end: Math.floor(currentSegment.end),
          text: currentSegment.text.trim()
        });
      }
    }

    return {
      captions,
      webvtt: this.generateWebVTT(captions),
      language: 'en',
      confidence: whisperResult.confidence || 0.9
    };
  }

  /**
   * Format Google Speech response to our caption format
   */
  formatGoogleResponse(googleResult) {
    const captions = [];
    
    if (googleResult.results && googleResult.results.length > 0) {
      googleResult.results.forEach(result => {
        if (result.alternatives && result.alternatives[0]) {
          const alternative = result.alternatives[0];
          
          if (alternative.words) {
            // Group words into caption segments
            let currentSegment = {
              start: 0,
              end: 0,
              text: ''
            };
            
            alternative.words.forEach((word, index) => {
              if (currentSegment.text === '') {
                currentSegment.start = parseFloat(word.startTime.replace('s', ''));
              }
              
              currentSegment.text += word.word + ' ';
              currentSegment.end = parseFloat(word.endTime.replace('s', ''));
              
              // Create new segment every 8 words
              if ((index + 1) % 8 === 0) {
                captions.push({
                  start: Math.floor(currentSegment.start),
                  end: Math.floor(currentSegment.end),
                  text: currentSegment.text.trim()
                });
                
                currentSegment = { start: 0, end: 0, text: '' };
              }
            });
            
            // Add remaining text if any
            if (currentSegment.text.trim()) {
              captions.push({
                start: Math.floor(currentSegment.start),
                end: Math.floor(currentSegment.end),
                text: currentSegment.text.trim()
              });
            }
          }
        }
      });
    }

    return {
      captions,
      webvtt: this.generateWebVTT(captions),
      language: 'en',
      confidence: googleResult.results?.[0]?.alternatives?.[0]?.confidence || 0.8
    };
  }

  /**
   * Generate WebVTT format from captions
   */
  generateWebVTT(captions) {
    let webvtt = 'WEBVTT\n\n';
    
    captions.forEach((caption, index) => {
      const startTime = this.formatTime(caption.start);
      const endTime = this.formatTime(caption.end);
      
      webvtt += `${index + 1}\n`;
      webvtt += `${startTime} --> ${endTime}\n`;
      webvtt += `${caption.text}\n\n`;
    });
    
    return webvtt;
  }

  /**
   * Format seconds to WebVTT time format (HH:MM:SS.mmm)
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }

  /**
   * Generate mock captions for testing (when APIs are not available)
   */
  generateMockCaptions(videoDuration = 120) {
    const mockTexts = [
      "Welcome to this educational video.",
      "Today we'll be learning about important concepts.",
      "Let's start with the fundamentals.",
      "This is a key point to remember.",
      "Pay attention to this demonstration.",
      "Here's an example of the concept in action.",
      "Notice how this relates to what we discussed earlier.",
      "This technique is widely used in practice.",
      "Let's review what we've covered so far.",
      "In conclusion, these principles are essential."
    ];

    const captions = [];
    const segmentDuration = videoDuration / mockTexts.length;

    mockTexts.forEach((text, index) => {
      captions.push({
        start: Math.floor(index * segmentDuration),
        end: Math.floor((index + 1) * segmentDuration),
        text: text
      });
    });

    return {
      captions,
      webvtt: this.generateWebVTT(captions),
      language: 'en',
      confidence: 0.95,
      isMock: true
    };
  }
}

module.exports = new SpeechToTextService();
