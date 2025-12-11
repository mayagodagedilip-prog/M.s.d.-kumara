import React, { useState, useRef } from 'react';
import { Calculator, Printer, AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Sentiment, DecisionType, DecisionResult, StockData } from './types';
import { Input } from './components/Input';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [data, setData] = useState<StockData>({
    companyCode: '',
    peRatio: '15',
    rsiRatio: '50',
    sentiment: Sentiment.Neutral,
    peThreshold: '10',
    rsiThreshold: '32',
    notes: ''
  });

  const [result, setResult] = useState<DecisionResult | null>(null);
  
  // To highlight errors on specific fields
  const [errors, setErrors] = useState<{ pe?: boolean; rsi?: boolean }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors.pe || errors.rsi) setErrors({});
  };

  const getDecision = () => {
    const codeDisplay = data.companyCode.trim() ? `(${data.companyCode.toUpperCase()})` : '';
    const pe = parseFloat(data.peRatio);
    const rsi = parseFloat(data.rsiRatio);
    const peThresh = parseFloat(data.peThreshold) || 10;
    const rsiThresh = parseFloat(data.rsiThreshold) || 32;

    // Validation
    if (isNaN(pe) || pe <= 0) {
      setErrors(prev => ({ ...prev, pe: true }));
      setResult({
        type: DecisionType.Error,
        title: "දෝෂයකි (Error)",
        reason: `${codeDisplay} PE අනුපාතය නිවැරදිව ඇතුළත් කරන්න (0 ට වඩා වැඩි විය යුතුයි).`,
        className: "bg-red-50 text-red-700 border-red-500"
      });
      return;
    }

    if (isNaN(rsi) || rsi < 0 || rsi > 100) {
      setErrors(prev => ({ ...prev, rsi: true }));
      setResult({
        type: DecisionType.Error,
        title: "දෝෂයකි (Error)",
        reason: `${codeDisplay} RSI අනුපාතය 0 ත් 100 ත් අතර විය යුතුය.`,
        className: "bg-red-50 text-red-700 border-red-500"
      });
      return;
    }

    // Decision Logic
    let decision: DecisionResult;

    // A. BUY Logic
    if (pe < peThresh && rsi < rsiThresh) {
      decision = {
        type: DecisionType.Buy,
        title: `${codeDisplay} ✅ BUY (මිල දී ගන්න)`,
        reason: `PE අනුපාතය (${peThresh} ට අඩු) සහ RSI අනුපාතය (${rsiThresh} ට අඩු) වේ.`,
        className: "bg-green-50 text-green-800 border-green-600"
      };
    }
    // B. NOT BUY Logic
    else if (pe > 25 && rsi >= 70) {
      decision = {
        type: DecisionType.NotBuy,
        title: `${codeDisplay} ❌ Not Buy (මිල දී නොගන්න)`,
        reason: "PE අනුපාතය (25 ට වැඩි - Overvalued) සහ RSI අනුපාතය (70 ට වැඩි - Overbought) වේ.",
        className: "bg-red-50 text-red-800 border-red-600"
      };
    }
    // C. Neutral/Sentiment Logic
    else if (pe >= peThresh && pe <= 25 && rsi >= rsiThresh && rsi < 70) {
      if (data.sentiment === Sentiment.Positive) {
        decision = {
          type: DecisionType.Buy,
          title: `${codeDisplay} ✅ BUY (මිල දී ගන්න)`,
          reason: "මධ්‍යස්ථ තාක්ෂණික දත්ත; ඔබේ හැඟීම් (Positive) හේතුවෙන් Buy.",
          className: "bg-green-50 text-green-800 border-green-600"
        };
      } else if (data.sentiment === Sentiment.Negative) {
        decision = {
          type: DecisionType.NotBuy,
          title: `${codeDisplay} ❌ Not Buy (මිල දී නොගන්න)`,
          reason: "මධ්‍යස්ථ තාක්ෂණික දත්ත; ඔබේ හැඟීම් (Negative) හේතුවෙන් Not Buy.",
          className: "bg-red-50 text-red-800 border-red-600"
        };
      } else {
        decision = {
          type: DecisionType.NoDecision,
          title: `${codeDisplay} ⚠️ No Decision (තීරණයක් නැත)`,
          reason: "මධ්‍යස්ථ තාක්ෂණික දත්ත සහ මධ්‍යස්ථ හැඟීම් (Neutral).",
          className: "bg-amber-50 text-amber-800 border-amber-500"
        };
      }
    }
    // D. Fallback
    else {
      decision = {
        type: DecisionType.NoDecision,
        title: `${codeDisplay} ⚠️ No Decision (තීරණයක් නැත)`,
        reason: "දත්ත මිශ්‍රයි, පැහැදිලි තීරණයක් නැත. පරීක්ෂා කරන්න.",
        className: "bg-amber-50 text-amber-800 border-amber-500"
      };
    }

    setResult(decision);
  };

  const renderIcon = (type: DecisionType) => {
    switch (type) {
      case DecisionType.Buy: return <CheckCircle className="w-8 h-8 mb-2" />;
      case DecisionType.NotBuy: return <XCircle className="w-8 h-8 mb-2" />;
      case DecisionType.NoDecision: return <HelpCircle className="w-8 h-8 mb-2" />;
      case DecisionType.Error: return <AlertCircle className="w-8 h-8 mb-2" />;
      default: return null;
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 md:p-8 print:max-w-none print:p-0">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none border border-slate-100 print:border-none">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
          <h2 className="text-2xl font-bold text-slate-800 text-center flex items-center justify-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600 print:hidden" />
            කොටස් ආයෝජන තීරක
          </h2>
          <p className="text-center text-slate-500 text-sm mt-1">Stock Investment Decider</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Main Inputs */}
          <div className="space-y-4">
            <Input
              label="සමාගම් කේතය (Company Code):"
              name="companyCode"
              placeholder="උදා: LOLC, DIAL, NEST"
              value={data.companyCode}
              onChange={handleInputChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="PE අනුපාතය (Price-to-Earnings):"
                type="number"
                step="0.01"
                name="peRatio"
                value={data.peRatio}
                onChange={handleInputChange}
                error={errors.pe}
              />
              <Input
                label="RSI අනුපාතය (Relative Strength Index):"
                type="number"
                step="0.01"
                name="rsiRatio"
                value={data.rsiRatio}
                onChange={handleInputChange}
                error={errors.rsi}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1.5 font-semibold text-sm text-gray-700">
                ඔබගේ හැඟීම් (Your Sentiment):
              </label>
              <div className="relative">
                <select
                  name="sentiment"
                  value={data.sentiment}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 appearance-none bg-white"
                >
                  <option value={Sentiment.Neutral}>Neutral (මධ්‍යස්ථ)</option>
                  <option value={Sentiment.Positive}>Positive (ධනාත්මක / Bullish)</option>
                  <option value={Sentiment.Negative}>Negative (ඍණාත්මක / Bearish)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Thresholds Section */}
          <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300 print:bg-transparent print:border-slate-800 print:p-0 print:my-4">
            <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="print:hidden">⚙️</span> අභිරුචි තීරණ සීමාවන් (Custom Thresholds)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="PE 'Buy' සීමාව (පහළ අගය - Default: 10):"
                type="number"
                step="0.1"
                name="peThreshold"
                value={data.peThreshold}
                onChange={handleInputChange}
                className="bg-white"
              />
              <Input
                label="RSI 'Buy' සීමාව (පහළ අගය - Default: 32):"
                type="number"
                step="0.1"
                name="rsiThreshold"
                value={data.rsiThreshold}
                onChange={handleInputChange}
                className="bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block mb-1.5 font-semibold text-sm text-gray-700">
              ආයෝජනයට අදාළ සටහන් / අවදානම් සාධක:
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all"
              placeholder="උදා: නව කළමනාකාරීත්වය හොඳයි, හෝ වෙළෙඳපොළ අවදානම ඉහළයි."
              value={data.notes}
              onChange={handleInputChange}
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 print:hidden">
            <Button onClick={getDecision}>
              තීරණය ගන්න (Get Decision)
            </Button>
            <Button variant="secondary" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
              මුද්‍රණය කරන්න / PDF ලෙස සුරකින්න
            </Button>
          </div>

          {/* Result Area */}
          {result && (
            <div className={`mt-8 p-6 rounded-xl border-l-4 text-center transition-all animate-fade-in print:border-4 print:border-black print:bg-white print:text-black ${result.className}`}>
              <div className="flex flex-col items-center justify-center">
                {renderIcon(result.type)}
                <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                <span className="text-sm md:text-base opacity-90 block font-medium">
                  {result.reason}
                </span>
                
                {data.notes.trim() && (
                  <div className="mt-6 pt-4 border-t border-current border-opacity-20 w-full text-left">
                    <strong className="block text-sm opacity-75 mb-1">✍️ සටහන (Notes):</strong>
                    <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-xs print:hidden">
        &copy; {new Date().getFullYear()} Stock Investment Decider
      </div>
    </div>
  );
};

export default App;