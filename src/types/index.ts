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
  age: number;
  gender: 'male' | 'female';
  cholesterol: number;
  bloodPressure: number;
  heartRate: number;
  glucose: number;
  chestPainType: 'typical' | 'atypical' | 'nonAnginal' | 'asymptomatic';
  fastingBloodSugar: boolean;
  restingECG: 'normal' | 'sttWaveAbnormality' | 'leftVentricularHypertrophy';
  exerciseAngina: boolean;
  stDepression: number;
  stSlope: 'upsloping' | 'flat' | 'downsloping';
  numVessels: 0 | 1 | 2 | 3;
  thalassemia: 'normal' | 'fixedDefect' | 'reversibleDefect';
  target?: boolean;
}

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