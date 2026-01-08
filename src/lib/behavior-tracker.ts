
export interface UserAction {
  id: string;
  type: 'planning' | 'execution' | 'navigation' | 'feature_use' | 'success' | 'error';
  feature: string;
  details: Record<string, unknown>;
  timestamp: Date;
  sessionId: string;
  duration?: number;
}

export interface UserPreferences {
  visualVsText: 'visual' | 'text' | 'mixed';
  quickVsDetailed: 'quick' | 'detailed' | 'balanced';
  workingHours: {
    start: number; // hour of day
    end: number;
  };
  peakProductivityHours: number[];
  preferredFeatures: string[];
  successPatterns: Record<string, number>;
}

export class UserBehaviorTracker {
  private actions: UserAction[] = [];
  private sessionId: string;
  private startTime: Date;
  private preferences: UserPreferences;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.preferences = this.loadPreferences();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      this.trackAction('navigation', 'visibility_change', {
        visible: !document.hidden
      });
    });

    // Track mouse movements for engagement
    let lastMouseMove = Date.now();
    document.addEventListener('mousemove', () => {
      const now = Date.now();
      if (now - lastMouseMove > 5000) { // Only track every 5 seconds
        this.trackAction('feature_use', 'engagement', {
          type: 'mouse_movement',
          timestamp: now
        });
        lastMouseMove = now;
      }
    });
  }

  trackAction(type: UserAction['type'], feature: string, details: Record<string, unknown> = {}): void {
    const action: UserAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      feature,
      details,
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    this.actions.push(action);
    this.analyzeAndUpdatePreferences(action);
    this.persistToLocalStorage();
    
    console.log('Behavior tracked:', action);
  }

  trackFeatureStart(feature: string): string {
    const actionId = `start_${Date.now()}`;
    this.trackAction('planning', feature, {
      startId: actionId,
      phase: 'start'
    });
    return actionId;
  }

  trackFeatureComplete(feature: string, startId: string, success: boolean = true): void {
    const startAction = this.actions.find(a => a.details.startId === startId);
    const duration = startAction ? Date.now() - startAction.timestamp.getTime() : 0;
    
    this.trackAction(success ? 'success' : 'error', feature, {
      startId,
      duration,
      phase: 'complete'
    });
  }

  private analyzeAndUpdatePreferences(action: UserAction): void {
    // Update preferred features
    if (!this.preferences.preferredFeatures.includes(action.feature)) {
      this.preferences.preferredFeatures.push(action.feature);
    }

    // Track success patterns
    if (action.type === 'success') {
      this.preferences.successPatterns[action.feature] = 
        (this.preferences.successPatterns[action.feature] || 0) + 1;
    }

    // Analyze working hours
    const hour = action.timestamp.getHours();
    if (!this.preferences.peakProductivityHours.includes(hour) && 
        action.type === 'success') {
      this.preferences.peakProductivityHours.push(hour);
    }

    // Update working hours range
    if (hour < this.preferences.workingHours.start) {
      this.preferences.workingHours.start = hour;
    }
    if (hour > this.preferences.workingHours.end) {
      this.preferences.workingHours.end = hour;
    }
  }

  getInsights(): {
    totalActions: number;
    sessionDuration: number;
    topFeatures: string[];
    productivityScore: number;
    recommendations: string[];
  } {
    const now = new Date();
    const sessionDuration = now.getTime() - this.startTime.getTime();
    
    const featureUsage = this.actions.reduce((acc, action) => {
      acc[action.feature] = (acc[action.feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFeatures = Object.entries(featureUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature);

    const successRate = this.actions.filter(a => a.type === 'success').length / 
                       Math.max(this.actions.length, 1);
    
    const productivityScore = Math.round(successRate * 100);

    const recommendations = this.generateRecommendations();

    return {
      totalActions: this.actions.length,
      sessionDuration,
      topFeatures,
      productivityScore,
      recommendations
    };
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const currentHour = new Date().getHours();
    
    if (this.preferences.peakProductivityHours.includes(currentHour)) {
      recommendations.push("You're in a peak productivity hour - great time for complex tasks!");
    }
    
    if (this.preferences.successPatterns.campaigns > 5) {
      recommendations.push("You're great at campaigns - consider creating templates for faster setup");
    }
    
    if (this.actions.filter(a => a.type === 'planning').length > 
        this.actions.filter(a => a.type === 'execution').length) {
      recommendations.push("Try executing more of your planned actions to see better results");
    }

    return recommendations;
  }

  private loadPreferences(): UserPreferences {
    const stored = localStorage.getItem('user_behavior_preferences');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      visualVsText: 'mixed',
      quickVsDetailed: 'balanced',
      workingHours: { start: 9, end: 17 },
      peakProductivityHours: [],
      preferredFeatures: [],
      successPatterns: {}
    };
  }

  private persistToLocalStorage(): void {
    localStorage.setItem('user_behavior_preferences', JSON.stringify(this.preferences));
    localStorage.setItem('user_behavior_actions', JSON.stringify(this.actions.slice(-100))); // Keep last 100 actions
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.persistToLocalStorage();
  }
}

export const behaviorTracker = new UserBehaviorTracker();
