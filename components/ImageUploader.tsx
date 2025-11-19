import React, { useRef, useState } from 'react';
import { Upload, Camera } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  onAgeChange: (age: number) => void;
  initialAge: number;
  isAnalyzing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onAgeChange, initialAge, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [age, setAge] = useState<number>(initialAge);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = parseInt(e.target.value);
    setAge(newAge);
    onAgeChange(newAge);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Yemek Tabağını Analiz Et</h2>
        <p className="text-gray-500">Yapay zeka ile kalori ve besin değerlerini öğren.</p>
      </div>

      <div className="mb-6 text-left">
        <label className="block text-sm font-medium text-gray-700 mb-2">Yaşınız</label>
        <input
          type="number"
          min="1"
          max="120"
          value={age}
          onChange={handleAgeChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1">Analiz yaşınıza göre kişiselleştirilir.</p>
      </div>

      <div
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer transition-all duration-300 group hover:border-indigo-500 hover:bg-indigo-50 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-indigo-500 transition-colors" />
        <p className="text-sm text-gray-600 font-medium">Fotoğraf Yüklemek İçin Tıkla</p>
        <p className="text-xs text-gray-400 mt-1">veya sürükle bırak (JPG, PNG)</p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isAnalyzing}
      />
    </div>
  );
};

export default ImageUploader;
