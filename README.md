# Residential Property Sale Price Prediction

A machine learning project that estimates residential property selling prices using structural, quality, location, and other property characteristics.

## Project Overview

| Item | Description |
|---|---|
| Industry | Real estate and property valuation |
| ML task | Supervised regression |
| Target variable | `SalePrice` |
| Primary metric | Mean Absolute Error (MAE) |
| Supporting metrics | Root Mean Squared Error (RMSE) and R-squared (R²) |
| Dataset | Ames Housing / Kaggle House Prices: Advanced Regression Techniques |
| Repository | [IT24100765/house-price-predictor](https://github.com/IT24100765/house-price-predictor) |

## Problem Statement

Estimate the selling price of a residential property from its available characteristics.

The project aims to support data-driven pricing and valuation decisions. Feature analysis will also help identify property characteristics associated with selling prices.

### Stakeholders

- Real-estate companies.
- Property valuation professionals.
- Buyers and sellers seeking indicative property valuations.

### Objectives

- Understand the dataset and identify data-quality issues.
- Build a preprocessing workflow that prevents data leakage.
- Engineer and select meaningful property features.
- Establish a baseline and compare regression models.
- Evaluate predictive performance and generalization.
- Communicate influential features, limitations, and recommendations.

### Success Criteria

The project will assess success through consistent cross-validation, improvement over the baseline in MAE, supporting RMSE and R² results, and clear interpretation of model errors. A numerical performance threshold has not yet been specified.

## Dataset

**Source:** [Kaggle — House Prices: Advanced Regression Techniques](https://www.kaggle.com/c/house-prices-advanced-regression-techniques/data)

| Dataset | Rows | Columns | Target availability |
|---|---:|---:|---|
| Training set | 1,460 | 81 | Includes `SalePrice` |
| Competition test set | 1,459 | 80 | Does not include `SalePrice` |

The dataset contains numerical and categorical property attributes. The `Id` column will be excluded from prediction.

### Example Input Features

| Feature | Description |
|---|---|
| `OverallQual` | Overall material and finish quality |
| `GrLivArea` | Above-ground living area |
| `TotalBsmtSF` | Total basement area |
| `1stFlrSF` | First-floor area |
| `2ndFlrSF` | Second-floor area |
| `YearBuilt` | Original construction year |
| `YearRemodAdd` | Remodel year |
| `GarageCars` | Garage capacity in cars |
| `GarageArea` | Garage area |
| `Neighborhood` | Physical location within Ames |

Other available housing variables will also be examined.

### Initial Data Observations

Based on the supplied training-data summary:

- `SalePrice` ranges from **34,900 to 755,000**.
- Mean `SalePrice` is approximately **180,921**, compared with a median of **163,000**, suggesting a right-skewed distribution.
- `LotFrontage` contains **259 missing values**.
- `MasVnrArea` contains **8 missing values**.
- `LotArea` ranges from **1,300 to 215,245**, indicating extreme values that require investigation.
- Several amenity variables contain many zeros, which may represent the absence of those amenities.

These observations guide further analysis; they do not establish feature importance or justify automatic removal of records.

## Project Workflow

### 1. Problem Definition

Define stakeholders, objectives, the target variable, constraints, and success criteria for residential property valuation.

### 2. Data Understanding

Inspect training and test dimensions, variables, data types, numerical and categorical structure, and initial data-quality issues.

### 3. Exploratory Data Analysis

Examine:

- The distribution of `SalePrice`.
- Numerical and categorical feature distributions.
- Relationships between property characteristics and sale prices.
- Correlations and potentially redundant variables.
- Missing values, unusual observations, and potential outliers.

### 4. Data Preprocessing

- Separate `SalePrice` from input features.
- Remove `Id` from prediction inputs.
- Identify numerical and categorical columns, considering their meaning rather than data type alone.
- Handle missing values appropriately.
- Encode categorical variables.
- Apply robust scaling where appropriate for the model.
- Use pipeline-based preprocessing fitted within each training fold to prevent data leakage.

### 5. Feature Engineering and Selection

Consider the following derived variables:

| Feature | Formula | Purpose |
|---|---|---|
| `TotalSF` | `TotalBsmtSF + 1stFlrSF + 2ndFlrSF` | Summarize total floor area |
| `TotalBath` | `FullBath + BsmtFullBath + 0.5 × (HalfBath + BsmtHalfBath)` | Summarize bathroom provision |
| `HouseAge` | `YrSold - YearBuilt` | Represent property age at sale |

Compare feature-selection approaches and original versus engineered feature sets. Select the final representation using validation evidence while considering irrelevant or redundant information.

### 6. Model Development

Establish a baseline and compare:

- Linear Regression.
- Random Forest Regressor.
- XGBoost Regressor.
- Gradient Boosting Regressor.

Use consistent validation splits and appropriate preprocessing for each model.

### 7. Model Evaluation

Use **5-fold cross-validation** with MAE, RMSE, and R².

Also examine learning curves, residuals, and high-error predictions to assess generalization and model limitations.

The competition test set has no `SalePrice` labels, so local evaluation will use labeled training data. The competition test set will be used to generate predictions after model selection.

### 8. Interpretation and Responsibility

Analyze feature importance and influential property characteristics. Examine errors and consider whether performance varies across property groups.

Interpret associations carefully: predictive importance does not establish causation.

### 9. Recommendations

Recommend a model and feature representation based on validation performance, interpretability, and observed limitations. Identify opportunities for further improvement and suitable uses of the predictions.

### 10. Final Communication

Prepare the final report, visualizations, evidence tables, model comparisons, limitations, recommendations, presentation, and supporting code or notebooks.

## Evaluation Metrics

### Mean Absolute Error (MAE)

MAE measures the average absolute difference between actual and predicted prices.

It is the primary metric because it expresses prediction error directly in price units and is easy to interpret for valuation. **Lower is better.**

### Root Mean Squared Error (RMSE)

RMSE gives greater weight to large prediction errors and is also expressed in price units. **Lower is better.**

### R-squared (R²)

R² measures performance relative to predicting the mean target value. **Higher is better**, although it can be negative for poor predictions.

If a target transformation is used, price-unit MAE and RMSE must be calculated after converting predictions back to the original price scale.

## Tools and Technologies

- **Python** — implementation.
- **pandas and NumPy** — data manipulation and numerical operations.
- **Matplotlib and Seaborn** — visualizations.
- **scikit-learn** — preprocessing, pipelines, models, and evaluation.
- **XGBoost** — gradient-boosted regression.
- **Jupyter Notebook** — analysis and experiments.
- **Joblib** — saving fitted models and preprocessing pipelines.

## Results

Results will be added after the experiments are completed.

| Model | Cross-validation MAE ↓ | Cross-validation RMSE ↓ | Cross-validation R² ↑ |
|---|---|---|---|
| Baseline | Pending | Pending | Pending |
| Linear Regression | Pending | Pending | Pending |
| Random Forest | Pending | Pending | Pending |
| XGBoost | Pending | Pending | Pending |
| Gradient Boosting | Pending | Pending | Pending |

**Selected model:** Pending evaluation.  
**Final feature set:** Pending feature-selection experiments.

## Individual Contribution: Feature Engineering, Selection and Analysis

This contribution covers:

- Construction of meaningful engineered features.
- Comparison of feature-selection approaches.
- Analysis of feature relationships and redundancy.
- Comparison of original and engineered feature representations.
- Documentation of the selected feature set.
- Experimental evidence supporting feature choices.

## Limitations and Responsible Use

- The data represents properties in Ames; performance in other locations or market periods requires validation.
- Missing values, unusual properties, and rare categories may affect prediction quality.
- The available attributes may not capture every factor affecting market value.
- Predictions are indicative estimates and should support professional judgment.
- Feature importance describes model behavior and associations, not causal effects.

## Reproducibility

Before final submission, document:

- Python and dependency versions.
- Installation instructions.
- Notebook or script execution order.
- Random seeds and cross-validation settings.
- Final feature definitions and preprocessing decisions.
- Model-saving and prediction-generation steps.

## Team and Repository

**Group repository:** [https://github.com/IT24100765/house-price-predictor](https://github.com/IT24100765/house-price-predictor)

| Member | Student ID | Contribution |
|---|---|---|
| Fikry MAA | IT24100444 | Feature Engineering, Feature Selection & Analysis |
| [Name] | [Student ID] | [Assigned contribution] |
| [Name] | [Student ID] | [Assigned contribution] |
| [Name] | [Student ID] | [Assigned contribution] |

## Acknowledgements

Dataset provided through the Kaggle **House Prices: Advanced Regression Techniques** competition using Ames Housing data.
