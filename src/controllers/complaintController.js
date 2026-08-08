const Complaint = require('../models/Complaint');
const PriorityAnalyzer = require('../services/priorityAnalyzer');

class ComplaintController {
  static create(req, res) {
    const { title, description, category, location } = req.body;
    const evidenceImage = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description and category are required.' });
    }
    
    try {
      // AI Priority Analysis
      const aiAnalysis = PriorityAnalyzer.analyze({
        title,
        description,
        category,
        location,
        evidenceImage
      });
      
      // Use AI-determined priority
      const priority = aiAnalysis.priority;
      
      const complaint = Complaint.create({
        userId: req.userId,
        title,
        description,
        category,
        priority,
        location,
        evidenceImage,
        aiPriority: aiAnalysis.priority,
        aiConfidence: aiAnalysis.confidence,
        aiReason: aiAnalysis.reason,
        aiRiskFactors: JSON.stringify(aiAnalysis.riskFactors)
      });
      
      // Placeholder for future Computer Vision integration
      // This is where fake image/tampering detection would be integrated
      // For now, we just store the image path
      // TODO: Integrate CV-based fake detection here
      // 
      // Future implementation:
      // if (evidenceImage) {
      //   const isFake = await ComputerVision.detectTampering(evidenceImage);
      //   if (isFake) {
      //     return res.status(400).json({ error: 'Evidence image appears to be tampered or fake.' });
      //   }
      // }
      
      res.status(201).json(complaint);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not create complaint. Try again.' });
    }
  }
  
  // Error handler for multer
  static handleMulterError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
  
  static getByUser(req, res) {
    try {
      const complaints = Complaint.findByUserId(req.userId);
      res.json(complaints);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch complaints. Try again.' });
    }
  }
  
  static getById(req, res) {
    const { id } = req.params;
    
    try {
      const complaint = Complaint.findById(id);
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found.' });
      }
      
      // Ensure user can only access their own complaints
      if (complaint.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      
      res.json(complaint);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch complaint. Try again.' });
    }
  }
  
  static update(req, res) {
    const { id } = req.params;
    const updates = req.body;
    
    try {
      const complaint = Complaint.findById(id);
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found.' });
      }
      
      // Ensure user can only update their own complaints
      if (complaint.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      
      const updated = Complaint.update(id, updates);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not update complaint. Try again.' });
    }
  }
  
  static updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }
    
    const validStatuses = ['pending', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    
    try {
      const complaint = Complaint.findById(id);
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found.' });
      }
      
      // Ensure user can only update their own complaints
      if (complaint.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      
      const updated = Complaint.updateStatus(id, status);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not update complaint status. Try again.' });
    }
  }
  
  static delete(req, res) {
    const { id } = req.params;
    
    try {
      const complaint = Complaint.findById(id);
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found.' });
      }
      
      // Ensure user can only delete their own complaints
      if (complaint.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      
      Complaint.delete(id);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not delete complaint. Try again.' });
    }
  }
  
  static getStats(req, res) {
    try {
      const stats = Complaint.getStats(req.userId);
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch statistics. Try again.' });
    }
  }
  
  static getRecent(req, res) {
    const limit = parseInt(req.query.limit) || 5;
    
    try {
      const complaints = Complaint.getRecent(req.userId, limit);
      res.json(complaints);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not fetch recent complaints. Try again.' });
    }
  }
}

module.exports = ComplaintController;
