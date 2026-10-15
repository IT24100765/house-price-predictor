import os
import sys
import json
import joblib
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.base import BaseEstimator, TransformerMixin

# Define custom transformer so joblib unpickling succeeds smoothly
class HouseFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_copy = X.copy()
        # Combined Square Footage
        X_copy['TotalSF'] = (
            X_copy['TotalBsmtSF'].fillna(0) +
            X_copy['1stFlrSF'].fillna(0) +
            X_copy['2ndFlrSF'].fillna(0)
        )
        # Mathematically Corrected Bathrooms calculation
        X_copy['TotalBath'] = (
            X_copy['FullBath'].fillna(0) +
            (0.5 * X_copy['HalfBath'].fillna(0)) +
            X_copy['BsmtFullBath'].fillna(0) +
            (0.5 * X_copy['BsmtHalfBath'].fillna(0))
        )
        # Property age at sale time - ensure never negative
        if 'YrSold' in X_copy.columns and 'YearBuilt' in X_copy.columns:
            X_copy['HouseAge'] = (X_copy['YrSold'] - X_copy['YearBuilt']).clip(lower=0)
        else:
            X_copy['HouseAge'] = (2026 - X_copy['YearBuilt']).clip(lower=0)
        return X_copy

# Ensure the unpickler finds HouseFeatureEngineer in __main__
sys.modules['__main__'].HouseFeatureEngineer = HouseFeatureEngineer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'dist'))

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
CORS(app)

MODEL_PATH = os.path.join(BASE_DIR, 'house_price_model_final.pkl')
DEFAULTS_PATH = os.path.join(BASE_DIR, 'feature_defaults.json')
META_PATH = os.path.join(BASE_DIR, 'meta_info.json')

# Load Model
print(f"Loading model from {MODEL_PATH}...")
model = joblib.load(MODEL_PATH)
print("Model loaded successfully!")

# Load Feature Defaults
with open(DEFAULTS_PATH, 'r') as f:
    FEATURE_DEFAULTS = json.load(f)

# Load Meta Info
with open(META_PATH, 'r') as f:
    META_INFO = json.load(f)

# Sample Pre-configured Presets for instant testing
SAMPLE_PRESETS = [
    {
        "id": "luxury",
        "name": "Luxury Modern Estate",
        "tagline": "Top-tier finishes, expansive living space & 3-car garage",
        "icon": "diamond",
        "data": {
            "GrLivArea": 2850,
            "OverallQual": 9,
            "OverallCond": 8,
            "YearBuilt": 2018,
            "YearRemodAdd": 2021,
            "TotalBsmtSF": 1400,
            "FullBath": 3,
            "HalfBath": 1,
            "BedroomAbvGr": 4,
            "TotRmsAbvGrd": 9,
            "GarageCars": 3,
            "GarageArea": 840,
            "Fireplaces": 2,
            "LotArea": 13500,
            "Neighborhood": "NridgHt",
            "HouseStyle": "2Story",
            "BldgType": "1Fam",
            "CentralAir": "Y"
        }
    },
    {
        "id": "suburban",
        "name": "Suburban Family Home",
        "tagline": "Spacious 3-bed home in a friendly neighborhood",
        "icon": "home",
        "data": {
            "GrLivArea": 1750,
            "OverallQual": 7,
            "OverallCond": 6,
            "YearBuilt": 2004,
            "YearRemodAdd": 2010,
            "TotalBsmtSF": 950,
            "FullBath": 2,
            "HalfBath": 1,
            "BedroomAbvGr": 3,
            "TotRmsAbvGrd": 7,
            "GarageCars": 2,
            "GarageArea": 500,
            "Fireplaces": 1,
            "LotArea": 9600,
            "Neighborhood": "CollgCr",
            "HouseStyle": "2Story",
            "BldgType": "1Fam",
            "CentralAir": "Y"
        }
    },
    {
        "id": "ranch",
        "name": "Single-Story Ranch",
        "tagline": "Comfortable single-floor layout with full basement",
        "icon": "ranch",
        "data": {
            "GrLivArea": 1380,
            "OverallQual": 6,
            "OverallCond": 7,
            "YearBuilt": 1988,
            "YearRemodAdd": 2005,
            "TotalBsmtSF": 1200,
            "FullBath": 2,
            "HalfBath": 0,
            "BedroomAbvGr": 3,
            "TotRmsAbvGrd": 6,
            "GarageCars": 2,
            "GarageArea": 440,
            "Fireplaces": 1,
            "LotArea": 8500,
            "Neighborhood": "NAmes",
            "HouseStyle": "1Story",
            "BldgType": "1Fam",
            "CentralAir": "Y"
        }
    },
    {
        "id": "starter",
        "name": "Cozy Starter Home",
        "tagline": "Budget-friendly option ideal for first-time buyers",
        "icon": "key",
        "data": {
            "GrLivArea": 1050,
            "OverallQual": 5,
            "OverallCond": 5,
            "YearBuilt": 1965,
            "YearRemodAdd": 1980,
            "TotalBsmtSF": 800,
            "FullBath": 1,
            "HalfBath": 0,
            "BedroomAbvGr": 2,
            "TotRmsAbvGrd": 5,
            "GarageCars": 1,
            "GarageArea": 280,
            "Fireplaces": 0,
            "LotArea": 7200,
            "Neighborhood": "OldTown",
            "HouseStyle": "1Story",
            "BldgType": "1Fam",
            "CentralAir": "Y"
        }
    }
]

@app.route('/')
def index():
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return "House Price Prediction Backend is running! Build the frontend dist to view UI directly."

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model": "GradientBoosting + Scikit-Learn Pipeline",
        "features_count": len(FEATURE_DEFAULTS)
    })

@app.route('/api/meta', methods=['GET'])
def get_meta():
    return jsonify({
        "meta": META_INFO,
        "presets": SAMPLE_PRESETS,
        "defaults": {
            "GrLivArea": 1600,
            "OverallQual": 7,
            "OverallCond": 6,
            "YearBuilt": 2004,
            "YearRemodAdd": 2010,
            "TotalBsmtSF": 900,
            "FullBath": 2,
            "HalfBath": 1,
            "BedroomAbvGr": 3,
            "TotRmsAbvGrd": 7,
            "GarageCars": 2,
            "GarageArea": 480,
            "Fireplaces": 1,
            "LotArea": 9500,
            "Neighborhood": "CollgCr",
            "HouseStyle": "2Story",
            "BldgType": "1Fam",
            "CentralAir": "Y"
        }
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        user_input = request.get_json() or {}
        
        # Start with default training baseline
        full_features = dict(FEATURE_DEFAULTS)
        
        # Update with user-provided fields
        for key, val in user_input.items():
            if val is not None:
                full_features[key] = val
        
        # Smart sync for YearBuilt and YearRemodAdd
        year_built = float(full_features.get('YearBuilt', 2004))
        year_remod = float(full_features.get('YearRemodAdd', year_built))
        if year_remod < year_built:
            year_remod = year_built
            full_features['YearRemodAdd'] = year_remod

        # Intelligently sync derived/correlated features if user adjusted core fields
        gr_liv = float(full_features.get('GrLivArea', 1500))
        house_style = full_features.get('HouseStyle', '1Story')
        if house_style in ['1Story', 'SFoyer', 'SLvl']:
            full_features['1stFlrSF'] = gr_liv
            full_features['2ndFlrSF'] = 0.0
        else:
            full_features['1stFlrSF'] = round(gr_liv * 0.58)
            full_features['2ndFlrSF'] = round(gr_liv * 0.42)
            
        # Ensure Garage Area correlates with Garage Cars if not customized
        if 'GarageCars' in user_input and 'GarageArea' not in user_input:
            full_features['GarageArea'] = float(user_input['GarageCars']) * 240.0
            
        # Ensure YrSold is aligned: keep it at or above YearBuilt to prevent negative age
        current_year = 2026
        full_features['YrSold'] = max(current_year, float(year_built))

        # Create 1-row DataFrame
        df_input = pd.DataFrame([full_features])
        
        # Predict using pipeline
        pred_raw = float(model.predict(df_input)[0])
        pred_rounded = round(pred_raw, 2)
        
        # Calculate helpful analytics
        price_low = round(pred_rounded * 0.95)
        price_high = round(pred_rounded * 1.05)
        price_per_sqft = round(pred_rounded / gr_liv) if gr_liv > 0 else 0

        # Detailed property age analysis
        raw_age = max(0, int(current_year - year_built))
        is_remodeled = int(year_remod) > int(year_built)
        remodel_years_ago = max(0, int(current_year - year_remod))

        if raw_age == 0:
            age_label = "Brand New"
            age_status = "New Construction"
        elif raw_age == 1:
            age_label = "1 Year Old"
            age_status = "Recently Completed"
        else:
            age_label = f"{raw_age} Years"
            if raw_age <= 15:
                age_status = "Modern Build"
            elif raw_age <= 40:
                age_status = "Established Home"
            else:
                age_status = "Mature / Classic"
        
        return jsonify({
            "success": True,
            "predicted_price": pred_rounded,
            "formatted_price": f"${pred_rounded:,.0f}",
            "price_range": {
                "low": price_low,
                "high": price_high,
                "formatted_low": f"${price_low:,.0f}",
                "formatted_high": f"${price_high:,.0f}"
            },
            "price_per_sqft": price_per_sqft,
            "property_age": {
                "age_years": raw_age,
                "label": age_label,
                "status": age_status,
                "year_built": int(year_built),
                "year_remodel": int(year_remod),
                "is_remodeled": is_remodeled,
                "remodel_years_ago": remodel_years_ago,
                "subtext": f"Remodeled in {int(year_remod)} ({remodel_years_ago} yrs ago)" if is_remodeled else f"Original build ({int(year_built)})"
            },
            "inputs_used": {
                "GrLivArea": gr_liv,
                "OverallQual": full_features.get('OverallQual'),
                "OverallCond": full_features.get('OverallCond'),
                "YearBuilt": full_features.get('YearBuilt'),
                "YearRemodAdd": full_features.get('YearRemodAdd'),
                "TotalBsmtSF": full_features.get('TotalBsmtSF'),
                "FullBath": full_features.get('FullBath'),
                "BedroomAbvGr": full_features.get('BedroomAbvGr'),
                "GarageCars": full_features.get('GarageCars'),
                "Neighborhood": full_features.get('Neighborhood')
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting House Price Prediction Server on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
