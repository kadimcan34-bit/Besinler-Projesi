import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutritionData } from '../types';

interface NutritionChartsProps {
  data: NutritionData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue (Protein), Green (Carbs), Orange (Fat)

const NutritionCharts: React.FC<NutritionChartsProps> = ({ data }) => {
  const chartData = [
    { name: 'Protein', value: data.macros.protein },
    { name: 'Karbonhidrat', value: data.macros.carbs },
    { name: 'Yağ', value: data.macros.fat },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Besin Dağılımı</h3>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-bold uppercase">Protein</p>
          <p className="text-lg font-bold text-blue-800">%{data.macros.protein}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-600 font-bold uppercase">Karb</p>
          <p className="text-lg font-bold text-green-800">%{data.macros.carbs}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-orange-600 font-bold uppercase">Yağ</p>
          <p className="text-lg font-bold text-orange-800">%{data.macros.fat}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Tahmini Kalori</span>
          <span className="text-xl font-bold text-gray-800">{data.estimatedCalories} kcal</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sağlık Puanı</span>
          <span className={`text-xl font-bold ${data.healthScore >= 7 ? 'text-green-500' : data.healthScore >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
            {data.healthScore}/10
          </span>
        </div>
      </div>
    </div>
  );
};

export default NutritionCharts;
