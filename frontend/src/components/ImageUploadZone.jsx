import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, Check } from 'lucide-react';
import { SAMPLE_IMAGES } from '../context/AppContext';

export const ImageUploadZone = ({
  onImageSelected,
  onSampleSelected,
  selectedFile,
  previewUrl,
  onClear,
  sampleCategory = 'safety' // 'safety' or 'structural'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('File exceeds 15MB limit.');
      return;
    }
    onImageSelected(file);
  };

  const relevantSamples = sampleCategory === 'safety' 
    ? [SAMPLE_IMAGES.scaffold, SAMPLE_IMAGES.excavation]
    : [SAMPLE_IMAGES.beamCrack, SAMPLE_IMAGES.retainingWall];

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group aspect-video max-h-72 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Site Inspection Preview"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-md transition"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/60 text-white text-xs backdrop-blur-sm">
            {selectedFile ? selectedFile.name : 'Selected Site Image'}
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-safety-500 bg-safety-50/50'
              : 'border-slate-300 hover:border-safety-400 bg-slate-50/50 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="mx-auto w-12 h-12 rounded-full bg-safety-100 flex items-center justify-center text-safety-600 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Click to upload or drag & drop inspection photo
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            High-resolution JPG, PNG, or WebP up to 15MB
          </p>
        </div>
      )}

      {/* Quick sample image selector for immediate demo testing */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-safety-500" />
            <span>Or try a 1-click sample inspection image:</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {relevantSamples.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSampleSelected(sample)}
              className="flex items-center space-x-2.5 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-safety-300 text-left transition group"
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-10 h-10 rounded object-cover shrink-0 border border-slate-100"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-safety-600">
                  {sample.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {sample.type || sample.structure}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
