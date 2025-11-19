import React, { useState } from 'react';
import { Utensils, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import NutritionCharts from './components/NutritionCharts';
import ImageEditor from './components/ImageEditor';
import ChatAssistant from './components/ChatAssistant';
import { analyzeFoodImage } from './services/geminiService';
import { NutritionData, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [age, setAge] = useState<number>(30); // Default age
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (base64: string) => {
    setCurrentImage(base64);
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const data = await analyzeFoodImage(base64, age);
      setNutritionData(data);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setError("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentImage(null);
    setNutritionData(null);
    setError(null);
  };

  const handleImageEdited = (newImage: string) => {
    setCurrentImage(newImage);
    // Optionally re-analyze, but for now we just update the visual
    // For a full app, we might want a "Re-analyze" button
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              TabakAnaliz AI
            </span>
          </div>
          {appState === AppState.RESULTS && (
            <button 
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Yeni Analiz
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <ImageUploader 
              onImageSelected={handleImageSelected} 
              onAgeChange={setAge}
              initialAge={age}
              isAnalyzing={false}
            />
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
             <div className="relative w-24 h-24 mb-8">
               <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
               <Utensils className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Tabağınız Analiz Ediliyor...</h2>
             <p className="text-gray-500">Yapay zeka besinleri tanıyor ve hesaplamalar yapıyor.</p>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bir Hata Oluştu</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Tekrar Dene
            </button>
          </div>
        )}

        {appState === AppState.RESULTS && nutritionData && currentImage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            
            {/* Left Column: Image & Editor */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <img 
                  src={currentImage} 
                  alt="Analyzed food" 
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
              <ImageEditor 
                originalImage={currentImage}
                onImageUpdated={handleImageEdited}
              />
              
              {/* Ingredients List */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Tespit Edilen İçerikler</h3>
                <div className="flex flex-wrap gap-2">
                  {nutritionData.ingredients.map((item, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Chat */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Top Stats Cards */}
              <NutritionCharts data={nutritionData} />

              {/* Analysis Text */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-3">Yapay Zeka Görüşü</h3>
                <p className="opacity-90 leading-relaxed mb-4">{nutritionData.analysis}</p>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20 mt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-white text-indigo-600 text-xs px-2 py-0.5 rounded">Yaş: {age}</span>
                    Özel Tavsiye
                  </h4>
                  <p className="text-sm opacity-90">{nutritionData.ageBasedAdvice}</p>
                </div>
              </div>

              {/* Chat Interface */}
              <ChatAssistant context={`Yemek: ${nutritionData.ingredients.join(', ')}. Kalori: ${nutritionData.estimatedCalories}. Analiz: ${nutritionData.analysis}`} />

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
