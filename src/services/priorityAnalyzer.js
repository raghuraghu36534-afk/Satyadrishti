/**
 * AI Priority Analyzer Service
 * Analyzes complaint text and determines priority based on severity, urgency, and public safety factors
 */

class PriorityAnalyzer {
  // Keywords and phrases that indicate different priority levels
  static HIGH_PRIORITY_KEYWORDS = [
    // Safety/Emergency
    'emergency', 'dangerous', 'hazard', 'life threatening', 'life-threatening',
    'fire', 'explosion', 'electrocution', 'electrocute', 'shock', 'burn',
    'collapse', 'collapse', 'falling', 'debris', 'structural',
    'flood', 'flooding', 'water main', 'burst pipe',
    'gas leak', 'gas smell', 'carbon monoxide', 'poison',
    'accident', 'injury', 'injured', 'death', 'fatal', 'casualty',
    'assault', 'attack', 'violence', 'weapon', 'gun', 'knife',
    'theft', 'robbery', 'burglary', 'break-in',
    
    // Infrastructure critical
    'power outage', 'blackout', 'no electricity', 'no power',
    'no water', 'water outage', 'contaminated water',
    'road blocked', 'bridge collapse', 'major damage',
    'sewage', 'overflow', 'backup',
    
    // Health critical
    'epidemic', 'outbreak', 'contagious', 'infectious',
    'hospital', 'medical emergency', 'ambulance',
    
    // Urgent public services
    'traffic light', 'street light', 'broken traffic signal',
    'pothole', 'sinkhole', 'road damage',
    'exposed wires', 'live wires', 'electrical',
    
    // Severe weather/Environmental
    'storm damage', 'tree fallen', 'blocked road',
    'pollution', 'chemical spill', 'toxic',
    
    // Urgent language
    'urgent', 'immediately', 'asap', 'right now', 'critical',
    'severe', 'extreme', 'serious', 'major'
  ];

  static MEDIUM_PRIORITY_KEYWORDS = [
    // Infrastructure
    'broken', 'damaged', 'not working', 'malfunction',
    'leak', 'dripping', 'crack', 'hole',
    'pothole', 'uneven', 'damaged road',
    'street light', 'traffic light', 'sign',
    'garbage', 'trash', 'waste', 'dumping',
    'noise', 'loud', 'disturbance',
    
    // Public services
    'sanitation', 'cleaning', 'maintenance',
    'park', 'recreation', 'playground',
    'sidewalk', 'pathway', 'crosswalk',
    
    // Quality of life
    'nuisance', 'annoyance', 'inconvenience',
    'slow', 'delay', 'wait',
    
    // Moderate severity
    'issue', 'problem', 'concern', 'complaint',
    'needs attention', 'requires action'
  ];

  static LOW_PRIORITY_KEYWORDS = [
    // Minor issues
    'suggestion', 'recommendation', 'improvement',
    'cosmetic', 'aesthetic', 'appearance',
    'minor', 'small', 'little',
    'inconvenience', 'annoying',
    
    // Non-urgent
    'whenever', 'when possible', 'eventually',
    'nice to have', 'would be good',
    
    // Informational
    'question', 'inquiry', 'information',
    'feedback', 'comment'
  ];

  // Category-based priority weights
  static CATEGORY_PRIORITY = {
    'infrastructure': 'HIGH',
    'public_service': 'MEDIUM',
    'healthcare': 'HIGH',
    'education': 'MEDIUM',
    'environment': 'MEDIUM',
    'transportation': 'HIGH',
    'public_safety': 'HIGH',
    'other': 'MEDIUM'
  };

  /**
   * Analyze complaint and determine priority
   * @param {Object} complaint - Complaint data
   * @returns {Object} Priority analysis result
   */
  static analyze(complaint) {
    const { title, description, category, location, evidenceImage } = complaint;
    
    // Combine title and description for text analysis
    const fullText = `${title} ${description}`.toLowerCase();
    
    // Initialize scores
    let highScore = 0;
    let mediumScore = 0;
    let lowScore = 0;
    const riskFactors = [];
    
    // Analyze keywords
    highScore += this.countKeywordMatches(fullText, this.HIGH_PRIORITY_KEYWORDS) * 3;
    mediumScore += this.countKeywordMatches(fullText, this.MEDIUM_PRIORITY_KEYWORDS) * 2;
    lowScore += this.countKeywordMatches(fullText, this.LOW_PRIORITY_KEYWORDS) * 1;
    
    // Collect risk factors from high-priority keywords found
    this.HIGH_PRIORITY_KEYWORDS.forEach(keyword => {
      if (fullText.includes(keyword)) {
        riskFactors.push(keyword);
      }
    });
    
    // Category-based priority adjustment
    const categoryPriority = this.CATEGORY_PRIORITY[category] || 'MEDIUM';
    if (categoryPriority === 'HIGH') {
      highScore += 2;
    } else if (categoryPriority === 'MEDIUM') {
      mediumScore += 1;
    }
    
    // Location analysis - specific locations might indicate higher priority
    if (location) {
      const locationLower = location.toLowerCase();
      if (locationLower.includes('school') || locationLower.includes('hospital') || 
          locationLower.includes('market') || locationLower.includes('center')) {
        highScore += 2;
        riskFactors.push('high-traffic area');
      }
    }
    
    // Evidence image presence increases priority
    if (evidenceImage) {
      highScore += 1;
      riskFactors.push('evidence provided');
    }
    
    // Determine final priority
    let priority = 'MEDIUM';
    let confidence = 70;
    
    if (highScore >= 3) {
      priority = 'HIGH';
      confidence = Math.min(95, 70 + highScore * 5);
    } else if (highScore >= 1 || mediumScore >= 3) {
      priority = 'MEDIUM';
      confidence = Math.min(85, 65 + mediumScore * 3);
    } else if (lowScore >= 2) {
      priority = 'LOW';
      confidence = Math.min(80, 60 + lowScore * 3);
    } else {
      // Default to medium if no clear indicators
      priority = 'MEDIUM';
      confidence = 60;
    }
    
    // Generate reason
    const reason = this.generateReason(priority, riskFactors, category);
    
    return {
      priority,
      confidence,
      reason,
      riskFactors: riskFactors.slice(0, 5) // Limit to top 5 risk factors
    };
  }

  /**
   * Count keyword matches in text
   */
  static countKeywordMatches(text, keywords) {
    let count = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Generate human-readable reason for priority
   */
  static generateReason(priority, riskFactors, category) {
    const categoryFormatted = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (priority === 'HIGH') {
      if (riskFactors.length > 0) {
        return `This ${categoryFormatted} complaint involves ${riskFactors.slice(0, 3).join(', ')}, indicating an immediate safety or infrastructure concern requiring urgent attention.`;
      }
      return `This ${categoryFormatted} complaint has been classified as high priority due to the nature of the issue and potential impact on public safety or infrastructure.`;
    } else if (priority === 'MEDIUM') {
      if (riskFactors.length > 0) {
        return `This ${categoryFormatted} complaint involves ${riskFactors.slice(0, 2).join(', ')}. It requires attention but does not pose an immediate safety risk.`;
      }
      return `This ${categoryFormatted} complaint requires attention within a reasonable timeframe to maintain service quality and public satisfaction.`;
    } else {
      return `This ${categoryFormatted} complaint has been classified as low priority. It will be addressed as resources allow, typically within standard processing time.`;
    }
  }
}

module.exports = PriorityAnalyzer;