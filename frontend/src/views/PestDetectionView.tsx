import React, { useState, useRef } from 'react';
import { 
  Bug, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Layers,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { pestApi } from '../services/api';
import { useModal } from '../context/ModalContext';

export const PestDetectionView: React.FC = () => {
  const { showModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);

  // Sample leaf images for instant testing without taking camera photos
  const SAMPLE_LEAF_SCENARIOS = [
    {
      name: 'Tomato Early Blight',
      crop: 'Tomato',
      url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Corn Rust Lesion',
      crop: 'Corn',
      url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Healthy Vibrant Foliage',
      crop: 'Paddy',
      url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setDiagnosis(null);
    }
  };

  const handleSelectSample = async (sample: any) => {
    setAnalyzing(true);
    setSelectedImage(sample.url);
    try {
      // Create a blob from sample image to send to backend
      const resp = await fetch(sample.url);
      const blob = await resp.blob();
      const file = new File([blob], `${sample.name.replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);

      // Diagnose directly
      const result = await pestApi.detectPest(file);
      setDiagnosis(result);
    } catch {
      showModal({
        title: 'Diagnostic Error',
        message: 'Could not fetch sample leaf image. Try uploading a local photograph.',
        type: 'warning'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    try {
      const result = await pestApi.detectPest(selectedFile);
      setDiagnosis(result);
    } catch (err: any) {
      showModal({
        title: 'Diagnostic Error',
        message: err.response?.data?.detail || 'Computer vision foliar model failed to analyze image.',
        type: 'warning'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Computer Vision Foliar Pathology
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Autonomous Crop Disease Identification</h2>
          <p className="text-xs text-slate-500">Upload high-resolution foliar photographs for instant botanical diagnosis and IPM control recipes.</p>
        </div>

        {/* Quick Sample Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Load Demo Leaf:</span>
          {SAMPLE_LEAF_SCENARIOS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(s)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Diagnosis Studio */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Upload and Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Crop Leaf Photograph</h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[260px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Click to upload crop foliage</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, or WebP up to 15MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 bg-slate-900 group">
                  <img
                    src={selectedImage}
                    alt="Uploaded Foliage"
                    className="w-full h-full object-cover"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <div className="relative w-24 h-24 border-2 border-emerald-500/30 rounded-full flex items-center justify-center overflow-hidden bg-emerald-900/10">
                        <div className="absolute w-full h-1 bg-emerald-400 animate-scan shadow-[0_0_12px_#34d399]" />
                        <Bug size={36} className="text-emerald-400 animate-pulse" />
                      </div>
                      <p className="mt-4 text-xs font-bold tracking-wide">Extracting Spatial Lesion Features...</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{analyzing ? 'Analyzing...' : 'Diagnose Leaf'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feature Extraction Metrics */}
          {diagnosis && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Extracted Spectral & Spatial Features</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Necrotic Tissue</span>
                  <div className="text-base font-black text-rose-600 mt-0.5">{diagnosis.analyzed_features.necrotic_tissue_ratio}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Healthy Canopy</span>
                  <div className="text-base font-black text-emerald-600 mt-0.5">{diagnosis.analyzed_features.healthy_canopy_ratio}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Lesion Edge Density</span>
                  <div className="text-base font-black text-slate-900 mt-0.5">{diagnosis.analyzed_features.lesion_edge_density}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Vegetative Index</span>
                  <div className="text-base font-black text-blue-600 mt-0.5">{diagnosis.analyzed_features.vegetative_index}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagnosis Report */}
        <div className="lg:col-span-7 space-y-6">
          {diagnosis ? (
            <>
              {/* Primary Diagnosis Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-forest-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                      Severity: {diagnosis.severity}
                    </span>
                    <span className="text-[11px] text-slate-400">Crop: {diagnosis.crop_name}</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{diagnosis.disease_name}</h3>
                  <p className="text-xs text-slate-300 mt-1 font-mono">Pathogen: {diagnosis.pathogen}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-400">{diagnosis.confidence}%</div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vision Confidence</span>
                </div>
              </div>

              {/* Symptoms & Etiology */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Diagnostic Botanical Symptoms
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnosis.symptoms.map((sym: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Environmental Triggers & Causes
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnosis.causes.map((cause: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verified Preventive & Treatment Protocols */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2">
                    Preventative Integrated Pest Management (IPM)
                  </h4>
                  <ul className="space-y-2">
                    {diagnosis.preventive_measures.map((prev: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 mb-2">
                    Registered Chemical & Biological Treatment Guidance
                  </h4>
                  <ul className="space-y-2">
                    {diagnosis.treatment_guidance.map((treat: string, i: number) => (
                      <li key={i} className="text-xs text-slate-800 bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                        <FileText size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{treat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center shadow-sm h-full flex flex-col items-center justify-center">
              <Bug size={48} className="text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Awaiting Leaf Photography</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Upload a clear close-up picture of an affected crop leaf or choose a demo leaf scenario to inspect real computer vision diagnostics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
