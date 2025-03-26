import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../hooks/usePredictions';

// Form Data Type
interface FormPredictionData {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
  glucose: number;
  probability?: number;
  risk_level?: number;
}

// API Data Type
interface ApiPredictionData {
  user_id: string;
  created_at: string;
  age: number;
  gender: 'male' | 'female';
  cholesterol: number;
  bloodPressure: number;
  heartRate: number;
  glucose: number;
  chestPainType: number;
  fastingBloodSugar: boolean;
  restingECG: number;
  exerciseAngina: boolean;
  stDepression: number;
  stSlope: number;
  numVessels: number;
  thalassemia: number;
  probability?: number;
  risk_level?: number;
}

const Predict = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savePrediction } = usePredictions(user?.id || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormPredictionData>({
    age: 0,
    sex: 1,
    cp: 0,
    trestbps: 0,
    chol: 0,
    fbs: 0,
    restecg: 0,
    thalach: 0,
    exang: 0,
    oldpeak: 0,
    slope: 0,
    ca: 0,
    thal: 3,
    glucose: 0,
  });

  // Convert form data to API format
  const mapFormToApiData = (data: FormPredictionData): ApiPredictionData => ({
    user_id: user?.id || '',
    created_at: new Date().toISOString(),
    age: data.age,
    gender: data.sex === 1 ? 'male' : 'female',
    cholesterol: data.chol,
    bloodPressure: data.trestbps,
    heartRate: data.thalach,
    glucose: data.glucose,
    chestPainType: data.cp,
    fastingBloodSugar: data.fbs === 1, // Convert number to boolean
    restingECG: data.restecg,
    exerciseAngina: data.exang === 1, // Convert number to boolean
    stDepression: data.oldpeak,
    stSlope: data.slope,
    numVessels: data.ca,
    thalassemia: data.thal,
    probability: data.probability,
    risk_level: data.risk_level,
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

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapFormToApiData(formData)),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Prediction failed');

      // Ensure correct structure before saving
      const updatedPrediction: ApiPredictionData = {
        ...mapFormToApiData(formData),
        probability: result.probability,
        risk_level: result.risk_level,
      };

      const saveResponse = await savePrediction(updatedPrediction);
      if (saveResponse?.error) throw new Error(saveResponse.error);

      navigate('/results', { state: { predictionData: updatedPrediction } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const preventNonNumericInput = (e: React.KeyboardEvent) => {
    if (['.', 'e', '+', '-'].includes(e.key)) {
      e.preventDefault();
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
              {/* Age */}
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
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Age of the patient (in years)</small>
              </div>

              {/* Sex */}
              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                  Sex
                </label>
                <input
                  type="number"
                  id="sex"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.sex}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Ensure value is either 0 or 1
                    const validValue = isNaN(value) ? 1 : (value > 0 ? 1 : 0);
                    setFormData({ ...formData, sex: validValue });
                  }}
                  min="0"
                  max="1"
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Gender of the patient (1 = male, 0 = female)</small>
              </div>

              {/* Chest Pain Type */}
              <div>
                <label htmlFor="cp" className="block text-sm font-medium text-gray-700">
                  Chest Pain Type
                </label>
                <input
                  type="number"
                  id="cp"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.cp}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Ensure value is between 0 and 3
                    const validValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 3);
                    setFormData({ ...formData, cp: validValue });
                  }}
                  min="0"
                  max="3"
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">0 = asymptomatic, 1 = typical angina, 2 = atypical angina, 3 = non-anginal pain</small>
              </div>

              {/* Resting Blood Pressure */}
              <div>
                <label htmlFor="trestbps" className="block text-sm font-medium text-gray-700">
                  Resting Blood Pressure
                </label>
                <input
                  type="number"
                  id="trestbps"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.trestbps}
                  onChange={(e) => setFormData({ ...formData, trestbps: parseInt(e.target.value) || 0 })}
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Resting blood pressure (in mm Hg)</small>
              </div>

              {/* Serum Cholesterol */}
              <div>
                <label htmlFor="chol" className="block text-sm font-medium text-gray-700">
                  Serum Cholesterol
                </label>
                <input
                  type="number"
                  id="chol"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.chol}
                  onChange={(e) => setFormData({ ...formData, chol: parseInt(e.target.value) || 0 })}
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Serum cholesterol level (in mg/dl)</small>
              </div>

              {/* Fasting Blood Sugar */}
              <div>
                <label htmlFor="fbs" className="block text-sm font-medium text-gray-700">
                  Fasting Blood Sugar
                </label>
                <input
                  type="number"
                  id="fbs"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.fbs}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Ensure value is either 0 or 1
                    const validValue = isNaN(value) ? 0 : (value > 0 ? 1 : 0);
                    setFormData({ ...formData, fbs: validValue });
                  }}
                  min="0"
                  max="1"
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Fasting blood sugar &gt; 120 mg/dl (1 = true, 0 = false)</small>
              </div>

              {/* Resting ECG */}
              <div>
                <label htmlFor="restecg" className="block text-sm font-medium text-gray-700">
                  Resting ECG Results
                </label>
                <input
                  type="number"
                  id="restecg"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.restecg}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Ensure value is between 0 and 2
                    const validValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 2);
                    setFormData({ ...formData, restecg: validValue });
                  }}
                  min="0"
                  max="2"
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">0 = normal, 1 = having ST-T wave abnormality, 2 = showing probable/definite left ventricular hypertrophy</small>
              </div>

              {/* Maximum Heart Rate */}
              <div>
                <label htmlFor="thalach" className="block text-sm font-medium text-gray-700">
                  Maximum Heart Rate
                </label>
                <input
                  type="number"
                  id="thalach"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.thalach}
                  onChange={(e) => setFormData({ ...formData, thalach: parseInt(e.target.value) || 0 })}
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Maximum heart rate achieved</small>
              </div>

              {/* Exercise Induced Angina */}
              <div>
                <label htmlFor="exang" className="block text-sm font-medium text-gray-700">
                  Exercise Induced Angina
                </label>
                <input
                  type="number"
                  id="exang"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.exang}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Ensure value is either 0 or 1
                    const validValue = isNaN(value) ? 0 : (value > 0 ? 1 : 0);
                    setFormData({ ...formData, exang: validValue });
                  }}
                  min="0"
                  max="1"
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Exercise induced angina (1 = yes, 0 = no)</small>
              </div>

              {/* ST Depression */}
              <div>
                <label htmlFor="oldpeak" className="block text-sm font-medium text-gray-700">
                  ST Depression (Oldpeak)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="oldpeak"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.oldpeak}
                  onChange={(e) => setFormData({ ...formData, oldpeak: parseFloat(e.target.value) || 0 })}
                  required
                />
                <small className="text-gray-500">Depression induced by exercise relative to rest (ST depression)</small>
              </div>

              {/* ST Slope */}
              <div>
                <label htmlFor="slope" className="block text-sm font-medium text-gray-700">
                  ST Slope
                </label>
                <input
                  type="number"
                  id="slope"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.slope}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Ensure value is between 0 and 2
                    const validValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 2);
                    setFormData({ ...formData, slope: validValue });
                  }}
                  min="0"
                  max="2"
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Slope of the peak exercise ST segment (0 = upsloping, 1 = flat, 2 = downsloping)</small>
              </div>

              {/* Number of Major Vessels */}
              <div>
                <label htmlFor="ca" className="block text-sm font-medium text-gray-700">
                  Number of Major Vessels
                </label>
                <input
                  type="number"
                  id="ca"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.ca}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Ensure value is between 0 and 3
                    const validValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 3);
                    setFormData({ ...formData, ca: validValue });
                  }}
                  min="0"
                  max="3"
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Number of major vessels colored by fluoroscopy (0-3)</small>
              </div>

              {/* Thalassemia */}
              <div>
                <label htmlFor="thal" className="block text-sm font-medium text-gray-700">
                  Thalassemia
                </label>
                <input
                  type="number"
                  id="thal"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.thal}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Allow any number value
                    setFormData({ ...formData, thal: isNaN(value) ? 3 : value });
                  }}
                  required
                  onKeyDown={preventNonNumericInput}
                />
                <small className="text-gray-500">Thalassemia (traditionally 3 = normal, 6 = fixed defect, 7 = reversable defect, but any value accepted)</small>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Predict'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Predict;