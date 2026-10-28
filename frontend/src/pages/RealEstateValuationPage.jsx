import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Sparkles,
  Printer,
  RefreshCw,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { PrintableReportModal } from '../components/PrintableReportModal';

export const RealEstateValuationPage = () => {
  const { addToast } = useApp();

  const [location, setLocation] = useState('Downtown Metro Financial District');
  const [propertyType, setPropertyType] = useState('Luxury Residential Apartment');
  const [builtUpArea, setBuiltUpArea] = useState(2400);
  const [bedrooms, setBedrooms] = useState(3);
  const [ageYears, setAgeYears] = useState(2.5);
  const [floors, setFloors] = useState(1);
  const [constructionQuality, setConstructionQuality] = useState('Premium');
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Smart Home Automation',
    'Dedicated Parking Space',
    'LEED Certified Green Building'
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const availableAmenities = [
    'Smart Home Automation',
    'Dedicated Parking Space',
    'LEED Certified Green Building',
    '24/7 Power Backup (DG Set)',
    'High-Speed Service Elevators',
    'Rooftop Solar Array',
    'Swimming Pool & Clubhouse',
    'Acoustic Insulation Glass'
  ];

  const propertyTypes = [
    'Luxury Residential Apartment',
    'Single Family Suburban Villa',
    'Commercial Office Suite',
    'Industrial Logistics Warehouse',
    'Retail Commercial Showroom'
  ];

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        location,
        property_type: propertyType,
        built_up_area_sqft: Number(builtUpArea),
        bedrooms: Number(bedrooms),
        age_years: Number(ageYears),
        floors: Number(floors),
        construction_quality: constructionQuality,
        amenities: selectedAmenities,
      };

      const res = await api.estimateValuation(payload);
      setResult(res);
      addToast(`Estimated Valuation: $${res.estimated_avg_price.toLocaleString()}`, 'success');
    } catch (err) {
      console.error('Valuation error:', err);
      addToast(err.message || 'Error calculating valuation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Parametric Appraisal & Cost Modeling</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Real Estate Valuation Estimator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent multi-parameter valuation engine evaluating location baseline, physical depreciation, and amenity premiums.
          </p>
        </div>

        {result && (
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Export Valuation Sheet</span>
          </button>
        )}
      </div>

      {/* Grid: Form (5) + Output (7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Property Specifications</h2>
              <p className="text-xs text-slate-500">Configure spatial, quality, and location metrics</p>
            </div>
            <Sliders className="w-4 h-4 text-slate-400" />
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Location / Micro-Market
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Downtown Metro Financial District"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Classification
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
              >
                {propertyTypes.map((pt, i) => (
                  <option key={i} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Built-Up Area (sq.ft) *
                </label>
                <input
                  type="number"
                  min="200"
                  max="100000"
                  step="50"
                  required
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bedrooms (BHK)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asset Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  step="0.5"
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Floors / Levels
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-safety-500 focus:ring-1 focus:ring-safety-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Construction Quality Grade
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Luxury', 'Premium', 'Standard', 'Economy'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setConstructionQuality(q)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      constructionQuality === q
                        ? 'bg-safety-600 text-white border-safety-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Premium Amenities & Specifications
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                {availableAmenities.map((amenity, i) => {
                  const checked = selectedAmenities.includes(amenity);
                  return (
                    <label
                      key={i}
                      className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-white transition"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="rounded border-slate-300 text-safety-600 focus:ring-safety-500"
                      />
                      <span className={`text-[11px] truncate ${checked ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                        {amenity}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Hedonic Valuation Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Valuation Estimate</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-6 animate-in fade-in duration-200">
              {/* Valuation Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Modeled Market Value ({result.currency})
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-safety-500/20 text-safety-400 border border-safety-500/30 px-2 py-0.5 rounded-full">
                    90% Confidence Corridor
                  </span>
                </div>

                <div className="flex items-baseline space-x-3 my-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    ${result.estimated_avg_price.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-safety-400">
                    (${result.price_per_sqft.toLocaleString()}/sq.ft)
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-navy-800 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Conservative Valuation (Min)</span>
                    <span className="text-sm font-bold text-slate-200">
                      ${result.estimated_min_price.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Optimistic Valuation (Max)</span>
                    <span className="text-sm font-bold text-slate-200">
                      ${result.estimated_max_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <DemoDisclaimer
                mode={result.mode}
                title="Illustrative Valuation Methodology Disclaimer"
                text={result.disclaimer}
              />

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Executive Summary</span>
                {result.property_summary}
              </div>

              {/* Influencing Factors Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Valuation Sensitivity Drivers ({result.influencing_factors.length})
                </h4>

                <div className="space-y-2">
                  {result.influencing_factors.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-4">
                        <div className="font-semibold text-slate-900">{f.factor}</div>
                        <div className="text-[11px] text-slate-500 truncate">{f.description}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.impact === 'positive'
                            ? 'bg-emerald-50 text-emerald-700'
                            : f.impact === 'negative'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {f.weight_pct}% Weight
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Critical Model Assumptions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  {result.assumptions.map((asm, i) => (
                    <li key={i}>{asm}</li>
                  ))}
                </ul>
              </div>

              {/* Print Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need a client-ready valuation summary?</span>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Preview & Print Valuation Sheet &rarr;</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Ready to Compute Valuation</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Adjust property built-up area, micro-market location, and construction quality grade on the left to generate an instant econometric price corridor.
              </p>
            </div>
          )}
        </div>
      </div>

      <PrintableReportModal
        report={result}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
