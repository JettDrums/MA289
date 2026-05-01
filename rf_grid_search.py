"""
rf_grid_search.py
-----------------
Trains a RandomForestClassifier on the Titanic dataset across a full
hyperparameter grid and saves the results to rf_hyperparams.json.

The JS demo loads this file and replaces the theoretical math model
with real lookup values from the actual dataset.

Grid:
  n_estimators : [1, 5, 10, 20, 30, 50, 75, 100]
  max_depth    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  max_features : [1, 2, 3, 4, 5, 6, 7]   (Titanic has 7 features)

Total: 8 x 10 x 7 = 560 combinations.
Expected runtime: ~3-6 minutes.
"""

import json, time
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

# ── LOAD & PREPROCESS (identical to titanic_analysis.py) ─────────────────────
df = pd.read_csv(r'C:\Users\dennis.pezan\AppData\Local\Temp\train.csv')

df['Age'].fillna(df['Age'].median(), inplace=True)
df['Embarked'].fillna(df['Embarked'].mode()[0], inplace=True)
df['Sex']      = LabelEncoder().fit_transform(df['Sex'])
df['Embarked'] = LabelEncoder().fit_transform(df['Embarked'])

FEATURES = ['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked']
X = df[FEATURES]
y = df['Survived']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# ── GRID ─────────────────────────────────────────────────────────────────────
TREES    = [1, 5, 10, 20, 30, 50, 75, 100]
DEPTHS   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
FEATURES_GRID = [1, 2, 3, 4, 5, 6, 7]

total    = len(TREES) * len(DEPTHS) * len(FEATURES_GRID)
done     = 0
results  = {}
t0       = time.time()

print(f"Running {total} combinations...")

for n in TREES:
    for d in DEPTHS:
        for f in FEATURES_GRID:
            rf = RandomForestClassifier(
                n_estimators=n,
                max_depth=d,
                max_features=f,
                random_state=42,
                n_jobs=-1
            )
            rf.fit(X_train, y_train)
            train_acc = accuracy_score(y_train, rf.predict(X_train))
            test_acc  = accuracy_score(y_test,  rf.predict(X_test))
            cv        = cross_val_score(rf, X, y, cv=5, n_jobs=-1)

            key = f"{n}|{d}|{f}"
            results[key] = {
                "train": round(train_acc * 100, 1),
                "test":  round(test_acc  * 100, 1),
                "cv":    round(cv.mean() * 100, 1),
                "cv_std": round(cv.std() * 100, 1),
            }

            done += 1
            elapsed = time.time() - t0
            eta = (elapsed / done) * (total - done)
            print(f"  [{done:>3}/{total}] n={n:>3} d={d:>2} f={f}  "
                  f"test={test_acc*100:.1f}%  ETA {eta:.0f}s", flush=True)

# ── SAVE ─────────────────────────────────────────────────────────────────────
output = {
    "meta": {
        "trees":    TREES,
        "depths":   DEPTHS,
        "features": FEATURES_GRID,
        "dataset":  "Titanic (Kaggle)",
        "split":    "80/20, random_state=42",
        "cv_folds": 5
    },
    "data": results
}

out_path = r'C:\Users\dennis.pezan\Downloads\GAME_FILE\rf_hyperparams.json'
with open(out_path, 'w') as fh:
    json.dump(output, fh, indent=2)

print(f"\nDone in {time.time()-t0:.1f}s  ->  {out_path}")
