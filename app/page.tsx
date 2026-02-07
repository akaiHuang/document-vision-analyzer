'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';

type Mode = 'ocr' | 'describe' | 'analyze';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('ocr');
  const [prompt, setPrompt] = useState('');
  
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult('');
      setError(null);
      setProgress(0);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult('');
    setProgress(0);

    if (progressTimer.current) clearInterval(progressTimer.current);
    
    progressTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.max(1, Math.floor((90 - prev) / 10)); 
        return prev + increment;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', mode);
      if (mode === 'analyze') {
        formData.append('prompt', prompt);
      }

      const res = await fetch('/api/vision', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || 'Something went wrong');
      }

      setProgress(100);
      
      setTimeout(() => {
        setResult(data.text);
        setLoading(false);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setLoading(false);
    } finally {
      if (progressTimer.current) clearInterval(progressTimer.current);
    }
  };

  const getModeDescription = () => {
    switch(mode) {
      case 'ocr': return 'Extract text from documents, signs, and screenshots.';
      case 'describe': return 'Generate a detailed description of the image content.';
      case 'analyze': return 'Ask specific questions about the image.';
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] p-8 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">FawStudio Vision</h1>
          <p className="text-gray-400">Advanced Visual Analysis System</p>
        </header>

        {/* Tabs */}
        <div className="flex justify-center mb-8 bg-[#1a1d24] p-1 rounded-xl shadow-lg border border-[#2a2e37] w-fit mx-auto">
          {(['ocr', 'describe', 'analyze'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(''); setError(null); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m 
                  ? 'bg-slate-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#252932]'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-[#16181d] p-6 rounded-xl shadow-xl border border-[#2a2e37] flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-2 text-white">Input</h2>
            <p className="text-sm text-gray-500 mb-4">{getModeDescription()}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
              <div className="border-2 border-dashed border-[#2a2e37] rounded-lg p-4 text-center hover:border-slate-500 transition-colors cursor-pointer relative overflow-hidden group flex-grow min-h-[300px] flex items-center justify-center bg-[#0f1115]">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {!preview ? (
                  <div className="text-gray-500 group-hover:text-slate-400 transition-colors">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Click or drag image</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-full max-w-full rounded-lg shadow-sm object-contain"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg text-white pointer-events-none">
                      Change Image
                    </div>
                  </div>
                )}
              </div>

              {mode === 'analyze' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Your Question</label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., What color is the car? How many people are there?"
                    className="w-full p-3 bg-[#0f1115] border border-[#2a2e37] rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading || (mode === 'analyze' && !prompt)}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  !file || loading || (mode === 'analyze' && !prompt)
                    ? 'bg-[#2a2e37] text-gray-500 cursor-not-allowed' 
                    : 'bg-slate-600 hover:bg-slate-500 shadow-lg hover:shadow-slate-500/20'
                }`}
              >
                {loading ? 'Processing...' : `Start ${mode === 'ocr' ? 'OCR' : 'Analysis'}`}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/20 text-red-400 rounded-lg text-sm border border-red-900/50 flex items-start">
                 <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {error}
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-[#16181d] p-6 rounded-xl shadow-xl border border-[#2a2e37] h-full flex flex-col min-h-[500px]">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between text-white">
              Result
              {result && (
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full border border-green-900/50">Completed</span>
              )}
            </h2>
            <div className="flex-grow bg-[#0f1115] rounded-lg border border-[#2a2e37] overflow-hidden relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0f1115]/90 backdrop-blur-sm z-10">
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between mb-2 text-sm font-medium text-gray-400">
                      <span>Running {mode.toUpperCase()} model...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-[#2a2e37] rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-slate-500 h-3 rounded-full transition-all duration-300 ease-out relative"
                        style={{ width: `${progress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : result ? (
                <textarea 
                  className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-sm text-gray-300 leading-relaxed"
                  readOnly
                  value={result}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 p-8">
                  <svg className="w-16 h-16 mb-4 text-[#2a2e37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p>Output will appear here</p>
                </div>
              )}
            </div>
            {result && (
               <div className="mt-4 flex justify-end">
                 <button 
                   onClick={() => navigator.clipboard.writeText(result)}
                   className="text-sm text-slate-400 hover:text-white font-medium flex items-center transition-colors"
                 >
                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                   Copy
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
