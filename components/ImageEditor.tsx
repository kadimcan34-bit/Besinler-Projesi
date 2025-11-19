import React, { useState } from 'react';
import { Wand2, RefreshCw } from 'lucide-react';
import { editFoodImage } from '../services/geminiService';

interface ImageEditorProps {
  originalImage: string;
  onImageUpdated: (newImage: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ originalImage, onImageUpdated }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    
    setIsEditing(true);
    setError(null);
    
    try {
      const newImageBase64 = await editFoodImage(originalImage, prompt);
      onImageUpdated(newImageBase64);
      setPrompt('');
    } catch (err) {
      setError("Görüntü düzenlenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-purple-500" />
        AI Fotoğraf Düzenleyici
      </h4>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Örn: "Salatayı çıkar", "İçecek ekle"...'
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
        />
        <button
          onClick={handleEdit}
          disabled={isEditing || !prompt.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isEditing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            "Düzenle"
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default ImageEditor;
