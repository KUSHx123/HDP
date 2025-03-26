export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'doctor' | 'patient';
  avatar?: string;
  preferences: {
    darkMode: boolean;
    theme: 'default' | 'healthcare' | 'minimalist';
    notifications: boolean;
  };
}

export interface PredictionData {
  id: string; // Unique identifier
  user_id: string; // Reference to user
  age: number;
  gender: 'male' | 'female'; // Ensuring frontend consistency
  cholesterol: number;
  bloodPressure: number;
  heartRate: number;
  glucose: number;
  chestPainType: number;
  fastingBloodSugar: boolean;
  restingECG: number;
  exerciseAngina: boolean; // ✅ Ensure this exists
  stDepression: number;
  stSlope: number;
  numVessels: number;
  thalassemia: number;
  probability?: number;
  risk_level?: number;
  created_at: string; // Timestamp
}

// ✅ Ensure `ApiPredictionData` matches FastAPI expectations
export type ApiPredictionData = Omit<PredictionData, 'id' | 'created_at' | 'user_id'>;

export interface PredictionResult {
  probability: number;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  type: 'consultation' | 'followup';
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: 'warning' | 'tip' | 'achievement';
  message: string;
  date: string;
  dismissed: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'prediction' | 'appointment' | 'insight' | 'system';
  read: boolean;
  date: string;
}
