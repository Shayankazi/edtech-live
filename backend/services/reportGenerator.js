const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const performanceAnalytics = require('./performanceAnalytics');
const geminiService = require('./geminiService');

class ReportGenerator {
  /**
   * Generate PDF performance report
   */
  async generatePDFReport(userId, courseId, timeframe = '30d') {
    const reportData = await performanceAnalytics.generatePerformanceReport(userId, courseId, timeframe);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const fileName = `performance_report_${userId}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../../reports', fileName);
        
        // Ensure reports directory exists
        const reportsDir = path.join(__dirname, '../../reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'Performance Report');
        
        // Summary Section
        this.addSummarySection(doc, reportData.summary);
        
        // Performance Metrics
        this.addMetricsSection(doc, reportData.metrics);
        
        // AI Insights
        this.addInsightsSection(doc, reportData.insights);
        
        // Recommendations
        this.addRecommendationsSection(doc, reportData.recommendations);
        
        // Footer
        this.addFooter(doc, reportData.generatedAt);

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            url: `/reports/${fileName}`
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header to PDF
   */
  addHeader(doc, title) {
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text(title, { align: 'center' });
    
    doc.moveDown();
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    doc.moveDown(2);
    
    // Add a line separator
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke('#e5e7eb');
    
    doc.moveDown();
  }

  /**
   * Add summary section
   */
  addSummarySection(doc, summary) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('Performance Summary');
    
    doc.moveDown();
    
    const summaryItems = [
      { label: 'Total Sessions', value: summary.totalSessions },
      { label: 'Average Engagement', value: summary.averageEngagement },
      { label: 'Completion Rate', value: summary.averageCompletion },
      { label: 'Total Watch Time', value: summary.totalWatchTime }
    ];

    doc.fontSize(11)
       .font('Helvetica');

    summaryItems.forEach(item => {
      doc.fillColor('#6b7280')
         .text(`${item.label}: `, { continued: true })
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(item.value)
         .font('Helvetica');
    });

    doc.moveDown(2);
  }

  /**
   * Add metrics section
   */
  addMetricsSection(doc, metrics) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('Detailed Metrics');
    
    doc.moveDown();

    // Engagement Score
    this.addMetricBox(doc, 'Engagement Score', `${metrics.engagementScore}%`, this.getScoreColor(metrics.engagementScore));
    
    // Completion Rate
    this.addMetricBox(doc, 'Completion Rate', `${metrics.completionRate}%`, this.getScoreColor(metrics.completionRate));
    
    // Learning Patterns
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('Learning Patterns');
    
    doc.moveDown(0.5);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6b7280');

    const patterns = metrics.learningPatterns;
    doc.text(`• Preferred Study Time: ${patterns.preferredTime}`)
       .text(`• Average Session Length: ${patterns.sessionLength}`)
       .text(`• Interaction Style: ${patterns.interactionStyle}`)
       .text(`• Study Consistency: ${patterns.consistency}`);

    doc.moveDown(2);
  }

  /**
   * Add metric box
   */
  addMetricBox(doc, label, value, color) {
    const startY = doc.y;
    
    // Draw box
    doc.rect(50, startY, 200, 60)
       .fillAndStroke('#f9fafb', '#e5e7eb');
    
    // Add text
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(label, 60, startY + 15);
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor(color)
       .text(value, 60, startY + 30);
    
    doc.font('Helvetica');
    doc.y = startY + 70;
  }

  /**
   * Add insights section
   */
  addInsightsSection(doc, insights) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('AI-Generated Insights');
    
    doc.moveDown();

    // Strengths
    if (insights.strengths && insights.strengths.length > 0) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#059669')
         .text('Strengths');
      
      doc.moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280');

      insights.strengths.forEach(strength => {
        doc.text(`✓ ${strength}`);
      });
      
      doc.moveDown();
    }

    // Areas for Improvement
    if (insights.improvements && insights.improvements.length > 0) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#dc2626')
         .text('Areas for Improvement');
      
      doc.moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280');

      insights.improvements.forEach(improvement => {
        doc.text(`• ${improvement}`);
      });
      
      doc.moveDown();
    }

    // Learning Pattern
    if (insights.learningPattern) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Learning Style Analysis');
      
      doc.moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text(insights.learningPattern, { width: 450, align: 'justify' });
      
      doc.moveDown(2);
    }
  }

  /**
   * Add recommendations section
   */
  addRecommendationsSection(doc, recommendations) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('Personalized Recommendations');
    
    doc.moveDown();
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6b7280');

    recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, { width: 450, align: 'justify' });
      doc.moveDown(0.5);
    });

    doc.moveDown();
  }

  /**
   * Add footer
   */
  addFooter(doc, generatedAt) {
    // Add page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      // Footer line
      doc.moveTo(50, 750)
         .lineTo(545, 750)
         .stroke('#e5e7eb');
      
      // Footer text
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text(
           `Page ${i + 1} of ${range.count}`,
           50,
           760,
           { align: 'center', width: 495 }
         );
      
      doc.text(
        'EdTech Live - Performance Report',
        50,
        770,
        { align: 'center', width: 495 }
      );
    }
  }

  /**
   * Get color based on score
   */
  getScoreColor(score) {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#f59e0b';
    return '#dc2626';
  }

  /**
   * Generate CSV report
   */
  async generateCSVReport(userId, courseId, timeframe = '30d') {
    const reportData = await performanceAnalytics.generatePerformanceReport(userId, courseId, timeframe);
    
    const csvData = [
      ['Performance Report'],
      ['Generated', new Date().toISOString()],
      [],
      ['Metric', 'Value'],
      ['Total Sessions', reportData.summary.totalSessions],
      ['Average Engagement', reportData.summary.averageEngagement],
      ['Completion Rate', reportData.summary.averageCompletion],
      ['Total Watch Time', reportData.summary.totalWatchTime],
      [],
      ['Strengths'],
      ...reportData.insights.strengths.map(s => ['', s]),
      [],
      ['Areas for Improvement'],
      ...reportData.insights.improvements.map(i => ['', i]),
      [],
      ['Recommendations'],
      ...reportData.recommendations.map((r, i) => [`${i + 1}`, r])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    const fileName = `performance_report_${userId}_${Date.now()}.csv`;
    const filePath = path.join(__dirname, '../../reports', fileName);
    
    fs.writeFileSync(filePath, csvContent);
    
    return {
      fileName,
      filePath,
      url: `/reports/${fileName}`
    };
  }
}

module.exports = new ReportGenerator();
