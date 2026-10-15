import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class HouseFeatureEngineer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_copy = X.copy()
        total_bsmt_sf = X_copy['TotalBsmtSF'].fillna(0)
        first_flr_sf = X_copy['1stFlrSF'].fillna(0)
        second_flr_sf = X_copy['2ndFlrSF'].fillna(0)
        overall_qual = X_copy['OverallQual'].fillna(0)

        X_copy['TotalSF'] = total_bsmt_sf + first_flr_sf + second_flr_sf
        X_copy['TotalBath'] = (
            X_copy['FullBath'].fillna(0)
            + 0.5 * X_copy['HalfBath'].fillna(0)
            + X_copy['BsmtFullBath'].fillna(0)
            + 0.5 * X_copy['BsmtHalfBath'].fillna(0)
        )
        X_copy['HouseAge'] = X_copy['YrSold'] - X_copy['YearBuilt']
        X_copy['OverallQual_x_GrLivArea'] = overall_qual * X_copy['GrLivArea'].fillna(0)
        X_copy['OverallQual_x_TotalSF'] = overall_qual * X_copy['TotalSF']
        return X_copy


def high_correlation_pairs(X, threshold=0.85):
    numeric_features = X.select_dtypes(include=[np.number])
    absolute_correlations = numeric_features.corr().abs()
    upper_triangle = absolute_correlations.where(
        np.triu(np.ones(absolute_correlations.shape), k=1).astype(bool)
    )
    pairs = (
        upper_triangle.stack()
        .rename('Absolute Correlation')
        .loc[lambda scores: scores >= threshold]
        .sort_values(ascending=False)
        .reset_index()
        .rename(columns={'level_0': 'Feature 1', 'level_1': 'Feature 2'})
    )
    return pairs