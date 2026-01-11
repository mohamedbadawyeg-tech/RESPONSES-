
export interface PerformanceRating {
  factorId: string;
  score: number;
}

export interface PromotionStatus {
  promotionPotential: string;
  currentCapabilities: string;
}

export interface AssessmentResponse {
  id: string;
  employeeName: string;
  nationalId: string;
  mobileNumber: string;
  jobTitle: string;
  location: string;
  reviewDate: string;
  ratings: Record<string, number>;
  improvementAreas: string;
  plannedActions: string;
  trainingActivities: string;
  promotionPotential: string;
  currentCapabilities: string;
  employeeComments: string;
  timestamp: string;
}

export interface Factor {
  id: string;
  title: string;
  description: string;
}
