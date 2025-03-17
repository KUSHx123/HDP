import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../hooks/usePredictions';
import type { PredictionData } from '../types';

const Predict = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savePrediction } = usePredictions(user?.id || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PredictionData>({
    age: 0,
    gender: 'male',
    cholesterol: 0,
    bloodPressure: 0,
    heartRate: 0,
    glucose: 0,
    chestPainType: 'typical',
    fastingBloodSugar: false,
    restingECG: 'normal',
    exerciseAngina: false,
    stDepression: 0,
    stSlope: 'upsloping',
    numVessels: 0,
    thalassemia: 'normal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!user) {
      setError('Please sign in to make predictions');
      setIsLoading(false);
      return;
    }

    if (formData.age <= 0 || formData.cholesterol <= 0 || formData.bloodPressure <= 0 || 
        formData.heartRate <= 0 || formData.glucose <= 0 || formData.stDepression < 0) {
      setError('Please enter valid values for all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Calculate risk level (mock implementation)
      const riskLevel = Math.random(); // Replace with actual prediction logic

      const predictionData = {
        ...formData,
        risk_level: riskLevel
      };

      const { error: saveError } = await savePrediction(predictionData);
      
      if (saveError) {
        throw new Error(saveError);
      }

      navigate('/results', { 
        state: { 
          predictionData: {
            ...predictionData,
            probability: riskLevel
          }
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prediction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Heart Disease Prediction Tool</h2>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Blood Measurements */}
              <div>
                <label htmlFor="cholesterol" className="block text-sm font-medium text-gray-700">
                  Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  id="cholesterol"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.cholesterol}
                  onChange={(e) => setFormData({ ...formData, cholesterol: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  id="bloodPressure"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  id="heartRate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label htmlFor="glucose" className="block text-sm font-medium text-gray-700">
                  Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  id="glucose"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.glucose}
                  onChange={(e) => setFormData({ ...formData, glucose: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              {/* Chest Pain and ECG */}
              <div>
                <label htmlFor="chestPainType" className="block text-sm font-medium text-gray-700">
                  Chest Pain Type
                </label>
                <select
                  id="chestPainType"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.chestPainType}
                  onChange={(e) => setFormData({ ...formData, chestPainType: e.target.value as PredictionData['chestPainType'] })}
                  required
                >
                  <option value="typical">Typical Angina</option>
                  <option value="atypical">Atypical Angina</option>
                  <option value="nonAnginal">Non-Anginal Pain</option>
                  <option value="asymptomatic">Asymptomatic</option>
                </select>
              </div>

              <div>
                <label htmlFor="fastingBloodSugar" className="block text-sm font-medium text-gray-700">
                  Fasting Blood Sugar &gt; 120 mg/dl
                </label>
                <select
                  id="fastingBloodSugar"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.fastingBloodSugar.toString()}
                  onChange={(e) => setFormData({ ...formData, fastingBloodSugar: e.target.value === 'true' })}
                  required
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              <div>
                <label htmlFor="restingECG" className="block text-sm font-medium text-gray-700">
                  Resting ECG Results
                </label>
                <select
                  id="restingECG"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.restingECG}
                  onChange={(e) => setFormData({ ...formData, restingECG: e.target.value as PredictionData['restingECG'] })}
                  required
                >
                  <option value="normal">Normal</option>
                  <option value="sttWaveAbnormality">ST-T Wave Abnormality</option>
                  <option value="leftVentricularHypertrophy">Left Ventricular Hypertrophy</option>
                </select>
              </div>

              {/* Exercise and ST Depression */}
              <div>
                <label htmlFor="exerciseAngina" className="block text-sm font-medium text-gray-700">
                  Exercise Induced Angina
                </label>
                <select
                  id="exerciseAngina"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.exerciseAngina.toString()}
                  onChange={(e) => setFormData({ ...formData, exerciseAngina: e.target.value === 'true' })}
                  required
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              <div>
                <label htmlFor="stDepression" className="block text-sm font-medium text-gray-700">
                  ST Depression
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="stDepression"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.stDepression}
                  onChange={(e) => setFormData({ ...formData, stDepression: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label htmlFor="stSlope" className="block text-sm font-medium text-gray-700">
                  ST Slope
                </label>
                <select
                  id="stSlope"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.stSlope}
                  onChange={(e) => setFormData({ ...formData, stSlope: e.target.value as PredictionData['stSlope'] })}
                  required
                >
                  <option value="upsloping">Upsloping</option>
                  <option value="flat">Flat</option>
                  <option value="downsloping">Downsloping</option>
                </select>
              </div>

              {/* Vessels and Thalassemia */}
              <div>
                <label htmlFor="numVessels" className="block text-sm font-medium text-gray-700">
                  Number of Major Vessels
                </label>
                <select
                  id="numVessels"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.numVessels}
                  onChange={(e) => setFormData({ ...formData, numVessels: parseInt(e.target.value) as PredictionData['numVessels'] })}
                  required
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              <div>
                <label htmlFor="thalassemia" className="block text-sm font-medium text-gray-700">
                  Thalassemia
                </label>
                <select
                  id="thalassemia"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.thalassemia}
                  onChange={(e) => setFormData({ ...formData, thalassemia: e.target.value as PredictionData['thalassemia'] })}
                  required
                >
                  <option value="normal">Normal</option>
                  <option value="fixedDefect">Fixed Defect</option>
                  <option value="reversibleDefect">Reversible Defect</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Get Prediction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Predict;