import React, { useState, useEffect, useEffectEvent, useMemo } from 'react';
import { 
  Home, 
  Sparkles, 
  TrendingUp, 
  RotateCcw, 
  Building2, 
  Sliders, 
  Layers, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Maximize2, 
  Info,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { requestApi } from './api';

const CURRENT_YEAR = 2026;

const DEFAULT_FORM = {
  GrLivArea: 1750,
  OverallQual: 7,
  OverallCond: 6,
  YearBuilt: 2004,
  YearRemodAdd: 2010,
  TotalBsmtSF: 950,
  FullBath: 2,
  HalfBath: 1,
  BedroomAbvGr: 3,
  TotRmsAbvGrd: 7,
  GarageCars: 2,
  GarageArea: 500,
  Fireplaces: 1,
  LotArea: 9600,
  Neighborhood: 'CollgCr',
  HouseStyle: '2Story',
  BldgType: '1Fam',
  CentralAir: 'Y'
};

const QUALITY_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Below Average',
  5: 'Average',
  6: 'Above Average',
  7: 'Good',
  8: 'Very Good',
  9: 'Excellent',
  10: 'Very Excellent / Luxury'
};

const NEIGHBORHOOD_OPTIONS = [
  { value: 'CollgCr', label: 'College Creek (CollgCr)' },
  { value: 'Veenker', label: 'Veenker' },
  { value: 'Crawfor', label: 'Crawford' },
  { value: 'NoRidge', label: 'Northridge (NoRidge)' },
  { value: 'Mitchel', label: 'Mitchell' },
  { value: 'Somerst', label: 'Somerset' },
  { value: 'NWAmes', label: 'Northwest Ames (NWAmes)' },
  { value: 'OldTown', label: 'Old Town' },
  { value: 'BrkSide', label: 'Brookside' },
  { value: 'Sawyer', label: 'Sawyer' },
  { value: 'NridgHt', label: 'Northridge Heights (NridgHt)' },
  { value: 'NAmes', label: 'North Ames (NAmes)' },
  { value: 'SawyerW', label: 'Sawyer West' },
  { value: 'IDOTRR', label: 'Iowa DOT and Rail Road' },
  { value: 'MeadowV', label: 'Meadow Village' },
  { value: 'Edwards', label: 'Edwards' },
  { value: 'Timber', label: 'Timberland' },
  { value: 'Gilbert', label: 'Gilbert' },
  { value: 'StoneBr', label: 'Stone Brook' },
  { value: 'ClearCr', label: 'Clear Creek' },
  { value: 'NPkVill', label: 'Northpark Villa' },
  { value: 'Blmngtn', label: 'Bloomington Heights' },
  { value: 'BrDale', label: 'Briardale' },
  { value: 'SWISU', label: 'South & West of Iowa State' },
  { value: 'Blueste', label: 'Bluestem' }
];

export default function App() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [activePreset, setActivePreset] = useState('suburban');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [presets, setPresets] = useState([]);

  // Compute clear, human-readable property age
  const propertyAgeInfo = useMemo(() => {
    const rawAge = Math.max(0, CURRENT_YEAR - formData.YearBuilt);
    const isRemodeled = formData.YearRemodAdd > formData.YearBuilt;
    const remodelYearsAgo = Math.max(0, CURRENT_YEAR - formData.YearRemodAdd);

    let mainText = '';
    let subText = '';
    let category = '';

    if (rawAge <= 0) {
      mainText = 'Brand New';
      subText = 'New Construction';
      category = 'New Build';
    } else if (rawAge === 1) {
      mainText = '1 Year Old';
      subText = `Built in ${formData.YearBuilt}`;
      category = 'Modern';
    } else {
      mainText = `${rawAge} Years`;
      if (isRemodeled) {
        subText = `Remodeled in ${formData.YearRemodAdd} (${remodelYearsAgo} yrs ago)`;
        category = 'Renovated';
      } else {
        subText = `Built in ${formData.YearBuilt} (Original)`;
        category = rawAge <= 15 ? 'Modern' : (rawAge <= 40 ? 'Established' : 'Classic');
      }
    }

    return {
      rawAge,
      mainText,
      subText,
      isRemodeled,
      remodelYearsAgo,
      category
    };
  }, [formData.YearBuilt, formData.YearRemodAdd]);

  // Check backend health & fetch presets on load.
  useEffect(() => {
    let active = true;
    const checkBackendHealth = async () => {
      try {
        const data = await requestApi('meta');
        if (!active) return;
        if (Array.isArray(data.presets)) {
          setBackendOnline(true);
          if (data.presets && data.presets.length > 0) {
            setPresets(data.presets);
          }
        } else {
          setBackendOnline(false);
        }
      } catch (err) {
        if (!active) return;
        setBackendOnline(false);
        setErrorMsg(err.message);
      }
    };
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 65000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      
      // Keep YearRemodAdd and YearBuilt logically synced:
      // Remodeling cannot occur before construction
      if (field === 'YearBuilt' && next.YearRemodAdd < value) {
        next.YearRemodAdd = value;
      }
      if (field === 'YearRemodAdd' && value < next.YearBuilt) {
        next.YearBuilt = value;
      }
      
      return next;
    });
    setActivePreset(null);
  };

  const loadPreset = (preset) => {
    setActivePreset(preset.id);
    const updated = { ...DEFAULT_FORM, ...preset.data };
    setFormData(updated);
    handlePredict(updated);
  };

  const handlePredict = async (dataToPredict = formData) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await requestApi('predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToPredict)
      });

      if (result.success) {
        setPrediction(result);
        if (result.predicted_price > 300000) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      } else {
        setPrediction(null);
        setErrorMsg(result.error || 'Failed to calculate price');
      }
    } catch (err) {
      setPrediction(null);
      setBackendOnline(false);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM);
    setActivePreset('suburban');
    handlePredict(DEFAULT_FORM);
  };

  const predictCurrentForm = useEffectEvent(() => handlePredict(formData));

  // Predict with the current inputs when the backend becomes available.
  useEffect(() => {
    if (backendOnline) predictCurrentForm();
  }, [backendOnline]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <h1 className="brand-title">AuraPrice AI</h1>
            <p className="brand-subtitle">Machine Learning Model Deployment &bull; House Price Predictor</p>
          </div>
        </div>

        <div className="header-status">
          <div className="status-pill" style={{
            background: backendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            borderColor: backendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
            color: backendOnline ? '#34d399' : '#fbbf24'
          }}>
            <span className="status-dot" style={{
              background: backendOnline ? '#34d399' : '#fbbf24',
              boxShadow: backendOnline ? '0 0 10px #34d399' : '0 0 10px #fbbf24'
            }}></span>
            {backendOnline ? 'ML Pipeline Model Active' : 'Backend unavailable — retrying connection...'}
          </div>
        </div>
      </header>

      {/* Quick Test Presets */}
      <section className="presets-section">
        <div className="section-label">
          <Sparkles size={16} color="#38bdf8" />
          <span>Quick Benchmark Presets (Click to instant test)</span>
        </div>
        <div className="presets-grid">
          {(presets.length > 0 ? presets : [
            { id: 'luxury', name: 'Luxury Modern Estate', tagline: '2,850 sq ft • Quality 9/10 • 3-Car Garage' },
            { id: 'suburban', name: 'Suburban Family Home', tagline: '1,750 sq ft • Quality 7/10 • 2-Car Garage' },
            { id: 'ranch', name: 'Single-Story Ranch', tagline: '1,380 sq ft • Quality 6/10 • Single level' },
            { id: 'starter', name: 'Cozy Starter Home', tagline: '1,050 sq ft • Quality 5/10 • Budget friendly' }
          ]).map((preset) => (
            <button
              key={preset.id}
              className={`preset-card ${activePreset === preset.id ? 'active' : ''}`}
              onClick={() => loadPreset(preset)}
            >
              <div className="preset-header">
                <Home size={18} className="preset-icon" />
                <span className="preset-name">{preset.name}</span>
              </div>
              <p className="preset-desc">{preset.tagline}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Main Workspace: Form & Showcase Grid */}
      <main className="workspace-grid">
        {/* Form Controls */}
        <div className="form-panel">
          {/* Section 1: Core Dimensions */}
          <div className="form-group-title">
            <div className="title-left">
              <Maximize2 size={20} color="#6366f1" />
              <span>Living Space & Sizing</span>
            </div>
            <span className="input-value-badge">{formData.GrLivArea.toLocaleString()} Sq Ft</span>
          </div>

          <div className="fields-grid-2">
            <div className="input-block">
              <div className="input-label-row">
                <label className="input-label">Above Ground Living Area</label>
                <span className="input-value-badge">{formData.GrLivArea} sq ft</span>
              </div>
              <input
                type="range"
                min="500"
                max="4500"
                step="25"
                value={formData.GrLivArea}
                onChange={(e) => handleChange('GrLivArea', Number(e.target.value))}
                className="custom-slider"
              />
              <input
                type="number"
                value={formData.GrLivArea}
                onChange={(e) => handleChange('GrLivArea', Number(e.target.value))}
                className="custom-input"
              />
            </div>

            <div className="input-block">
              <div className="input-label-row">
                <label className="input-label">Total Basement Area</label>
                <span className="input-value-badge">{formData.TotalBsmtSF} sq ft</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={formData.TotalBsmtSF}
                onChange={(e) => handleChange('TotalBsmtSF', Number(e.target.value))}
                className="custom-slider"
              />
              <input
                type="number"
                value={formData.TotalBsmtSF}
                onChange={(e) => handleChange('TotalBsmtSF', Number(e.target.value))}
                className="custom-input"
              />
            </div>
          </div>

          {/* Section 2: Construction Quality & Rating */}
          <div className="form-group-title">
            <div className="title-left">
              <ShieldCheck size={20} color="#38bdf8" />
              <span>Overall Build Quality (1 to 10 Scale)</span>
            </div>
            <span className="input-value-badge">{QUALITY_LABELS[formData.OverallQual]} ({formData.OverallQual}/10)</span>
          </div>

          <div className="input-block" style={{ marginBottom: '24px' }}>
            <div className="quality-pills">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`quality-pill-btn ${formData.OverallQual === num ? 'active' : ''}`}
                  onClick={() => handleChange('OverallQual', num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Age & Renovation */}
          <div className="form-group-title">
            <div className="title-left">
              <Calendar size={20} color="#34d399" />
              <span>Age & Renovation Timeline</span>
            </div>
            <span className="input-value-badge" style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399' }}>
              <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {propertyAgeInfo.mainText}
            </span>
          </div>

          <div className="fields-grid-2">
            <div className="input-block">
              <div className="input-label-row">
                <label className="input-label">Year Built</label>
                <span className="input-value-badge">{formData.YearBuilt}</span>
              </div>
              <input
                type="range"
                min="1900"
                max="2026"
                value={formData.YearBuilt}
                onChange={(e) => handleChange('YearBuilt', Number(e.target.value))}
                className="custom-slider"
              />
              <input
                type="number"
                value={formData.YearBuilt}
                onChange={(e) => handleChange('YearBuilt', Number(e.target.value))}
                className="custom-input"
              />
            </div>

            <div className="input-block">
              <div className="input-label-row">
                <label className="input-label">Year Remodeled / Updated</label>
                <span className="input-value-badge">{formData.YearRemodAdd}</span>
              </div>
              <input
                type="range"
                min="1950"
                max="2026"
                value={formData.YearRemodAdd}
                onChange={(e) => handleChange('YearRemodAdd', Number(e.target.value))}
                className="custom-slider"
              />
              <input
                type="number"
                value={formData.YearRemodAdd}
                onChange={(e) => handleChange('YearRemodAdd', Number(e.target.value))}
                className="custom-input"
              />
            </div>
          </div>

          {/* Section 4: Rooms, Baths & Garage */}
          <div className="form-group-title">
            <div className="title-left">
              <Layers size={20} color="#f59e0b" />
              <span>Rooms, Bathrooms & Amenities</span>
            </div>
          </div>

          <div className="fields-grid-3">
            <div className="input-block">
              <label className="input-label">Bedrooms (Above Grade)</label>
              <select
                value={formData.BedroomAbvGr}
                onChange={(e) => handleChange('BedroomAbvGr', Number(e.target.value))}
                className="custom-select"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} Bedroom{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="input-block">
              <label className="input-label">Full Bathrooms</label>
              <select
                value={formData.FullBath}
                onChange={(e) => handleChange('FullBath', Number(e.target.value))}
                className="custom-select"
              >
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n} Full Bath{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="input-block">
              <label className="input-label">Garage Space</label>
              <select
                value={formData.GarageCars}
                onChange={(e) => {
                  const cars = Number(e.target.value);
                  handleChange('GarageCars', cars);
                  handleChange('GarageArea', cars * 250);
                }}
                className="custom-select"
              >
                {[0, 1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n === 0 ? 'No Garage' : `${n} Car${n > 1 ? 's' : ''}`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 5: Location & Style */}
          <div className="form-group-title">
            <div className="title-left">
              <MapPin size={20} color="#f43f5e" />
              <span>Neighborhood & Architectural Style</span>
            </div>
          </div>

          <div className="fields-grid-2">
            <div className="input-block">
              <label className="input-label">Neighborhood Location</label>
              <select
                value={formData.Neighborhood}
                onChange={(e) => handleChange('Neighborhood', e.target.value)}
                className="custom-select"
              >
                {NEIGHBORHOOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="input-block">
              <label className="input-label">House Style</label>
              <select
                value={formData.HouseStyle}
                onChange={(e) => handleChange('HouseStyle', e.target.value)}
                className="custom-select"
              >
                <option value="1Story">1-Story (Ranch / Bungalow)</option>
                <option value="2Story">2-Story</option>
                <option value="1.5Fin">1.5 Story (Finished Attic)</option>
                <option value="SLvl">Split Level</option>
                <option value="SFoyer">Split Foyer</option>
              </select>
            </div>
          </div>

          {/* Collapsible Advanced Settings */}
          <div
            className="collapsible-header"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              <Sliders size={18} color="#38bdf8" />
              <span>Detailed Specifications (Lot Area, Fireplaces, Air Conditioning)</span>
            </div>
            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {showAdvanced && (
            <div className="fields-grid-3" style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div className="input-block">
                <label className="input-label">Lot Area (Sq Ft)</label>
                <input
                  type="number"
                  value={formData.LotArea}
                  onChange={(e) => handleChange('LotArea', Number(e.target.value))}
                  className="custom-input"
                />
              </div>

              <div className="input-block">
                <label className="input-label">Fireplaces</label>
                <select
                  value={formData.Fireplaces}
                  onChange={(e) => handleChange('Fireplaces', Number(e.target.value))}
                  className="custom-select"
                >
                  {[0, 1, 2, 3].map(n => (
                    <option key={n} value={n}>{n} Fireplace{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="input-block">
                <label className="input-label">Central Air</label>
                <select
                  value={formData.CentralAir}
                  onChange={(e) => handleChange('CentralAir', e.target.value)}
                  className="custom-select"
                >
                  <option value="Y">Yes (Installed)</option>
                  <option value="N">No</option>
                </select>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-predict"
              onClick={() => handlePredict(formData)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Running ML Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles size={22} />
                  <span>Estimate House Price</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              title="Reset to defaults"
            >
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right Sticky Showcase Panel */}
        <div className="sticky-showcase">
          <div className="price-card">
            <div className="price-card-badge">
              <TrendingUp size={16} />
              <span>Machine Learning Valuation</span>
            </div>

            <div className="price-display-box">
              <div className="price-amount">
                {prediction ? prediction.formatted_price : '$---,---'}
              </div>
              <p className="price-caption">
                Estimated Market Value via Gradient Boosting Regressor
              </p>
            </div>

            {prediction && prediction.price_range && (
              <div className="price-corridor">
                <div className="corridor-row">
                  <span>95% Confidence Corridor</span>
                  <span style={{ color: '#38bdf8' }}>&plusmn;5% Variance</span>
                </div>
                <div className="corridor-bar">
                  <div className="corridor-fill"></div>
                </div>
                <div className="corridor-values">
                  <span>Low: {prediction.price_range.formatted_low}</span>
                  <span>High: {prediction.price_range.formatted_high}</span>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="metrics-grid">
              <div className="metric-pill">
                <span className="metric-pill-label">Price Per Sq Ft</span>
                <span className="metric-pill-val">
                  ${prediction?.price_per_sqft || Math.round(prediction?.predicted_price / (formData.GrLivArea || 1)) || 0} / sq ft
                </span>
              </div>

              <div className="metric-pill">
                <span className="metric-pill-label">Quality Score</span>
                <span className="metric-pill-val" style={{ color: '#38bdf8' }}>
                  {formData.OverallQual} / 10
                </span>
              </div>

              {/* Enhanced, Crystal-Clear Property Age Metric */}
              <div className="metric-pill">
                <span className="metric-pill-label">Property Age</span>
                <span 
                  className="metric-pill-val" 
                  style={{ color: propertyAgeInfo.rawAge === 0 ? '#34d399' : '#f8fafc' }}
                >
                  {propertyAgeInfo.mainText}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.2 }}>
                  {propertyAgeInfo.subText}
                </span>
              </div>

              <div className="metric-pill">
                <span className="metric-pill-label">Total Baths</span>
                <span className="metric-pill-val">
                  {formData.FullBath + (formData.HalfBath * 0.5)} Baths
                </span>
              </div>
            </div>
          </div>

          {/* Model & Architecture Summary Card */}
          <div className="insight-card">
            <div className="insight-header">
              <Info size={18} color="#818cf8" />
              <span>Model Architecture & Pipeline Specs</span>
            </div>

            <ul className="insight-list">
              <li className="insight-item">
                <span>Model Engine</span>
                <span className="insight-value">GradientBoostingRegressor</span>
              </li>
              <li className="insight-item">
                <span>Feature Pipeline</span>
                <span className="insight-value">HouseFeatureEngineer + ColumnTransformer</span>
              </li>
              <li className="insight-item">
                <span>Target Transform</span>
                <span className="insight-value">Log1p &amp; Expm1 Inversion</span>
              </li>
              <li className="insight-item">
                <span>Age Calculation</span>
                <span className="insight-value">{propertyAgeInfo.mainText} ({propertyAgeInfo.category})</span>
              </li>
              <li className="insight-item">
                <span>Pickle Source</span>
                <span className="insight-value" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>house_price_model_final.pkl</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
