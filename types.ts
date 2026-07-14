export interface CareerProspect {
  role: string;
  description: string;
}

export interface CareerMilestone {
  phase: string;
  title: string;
  activities: string[];
}

export interface MajorRecommendation {
  name: string;
  suitabilityReason: string;
  description: string;
  whatYouWillLearn: string[];
  futureProspects: CareerProspect[];
  highSchoolSubjectsToStrengthen: string[];
  hardSkills: string[];
  softSkills: string[];
  recommendedUniversities: string[];
  milestones: CareerMilestone[];
}

export interface CareerRoadmapData {
  recommendedMajors: MajorRecommendation[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface CustomMajorAnalysis {
  suitabilityStatus: string;
  suitabilityScore: number;
  analysisReason: string;
  whatToStrengthen: string[];
  futureProspects: { role: string; description: string; }[];
  hardSkills: string[];
  softSkills: string[];
  universityInsight: string;
}

