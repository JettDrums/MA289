import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import json
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import BaggingClassifier, RandomForestClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder

# ── LOAD & CLEAN ──────────────────────────────────────────────────────────────
df = pd.read_csv(r'C:\Users\dennis.pezan\AppData\Local\Temp\train.csv')

# Fill missing values
df['Age'].fillna(df['Age'].median(), inplace=True)
df['Embarked'].fillna(df['Embarked'].mode()[0], inplace=True)

# Encode categoricals
df['Sex'] = LabelEncoder().fit_transform(df['Sex'])          # male=1, female=0
df['Embarked'] = LabelEncoder().fit_transform(df['Embarked'])

# Features
FEATURES = ['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked']
X = df[FEATURES]
y = df['Survived']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# ── MODELS ────────────────────────────────────────────────────────────────────
dt  = DecisionTreeClassifier(max_depth=5, random_state=42)
bag = BaggingClassifier(estimator=DecisionTreeClassifier(max_depth=5),
                        n_estimators=50, random_state=42)
rf  = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)

models = {'Decision Tree': dt, 'Bagging': bag, 'Random Forest': rf}

results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc  = accuracy_score(y_test,  model.predict(X_test))
    cv_scores = cross_val_score(model, X, y, cv=5)
    results[name] = {
        'train_acc': round(train_acc * 100, 1),
        'test_acc':  round(test_acc  * 100, 1),
        'cv_mean':   round(cv_scores.mean() * 100, 1),
        'cv_std':    round(cv_scores.std()  * 100, 1),
    }
    print(f"{name}: Train={train_acc:.3f}  Test={test_acc:.3f}  CV={cv_scores.mean():.3f}±{cv_scores.std():.3f}")

# ── CHART 1: Accuracy Comparison ──────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
names  = list(results.keys())
train_ = [results[n]['train_acc'] for n in names]
test_  = [results[n]['test_acc']  for n in names]

x = np.arange(len(names))
w = 0.30
bars1 = ax.bar(x - w/2, train_, w, label='Train', color='#1a1a1a')
bars2 = ax.bar(x + w/2, test_,  w, label='Test',  color='#555555')

ax.set_ylabel('Accuracy (%)', fontsize=11)
ax.set_title('Model Accuracy Comparison — Titanic Dataset', fontsize=13, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(names, fontsize=11)
ax.set_ylim(60, 100)
ax.legend()
ax.yaxis.grid(True, alpha=0.3)
ax.set_axisbelow(True)

for bar in [*bars1, *bars2]:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
            f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=8)

plt.tight_layout()
plt.savefig(r'C:\Users\dennis.pezan\Downloads\GAME_FILE\img\chart_accuracy.png', dpi=150)
plt.close()
print("Saved chart_accuracy.png")

# ── CHART 2: Feature Importance (RF) ──────────────────────────────────────────
importances = rf.feature_importances_
sorted_idx  = np.argsort(importances)[::-1]
feat_names  = [FEATURES[i] for i in sorted_idx]
feat_vals   = [importances[i] for i in sorted_idx]

fig, ax = plt.subplots(figsize=(7, 4))
ax.barh(feat_names[::-1], feat_vals[::-1], color='#1a1a1a')
ax.set_xlabel('Importance Score', fontsize=11)
ax.set_title('Random Forest — Feature Importance', fontsize=13, fontweight='bold')
ax.xaxis.grid(True, alpha=0.3)
ax.set_axisbelow(True)
plt.tight_layout()
plt.savefig(r'C:\Users\dennis.pezan\Downloads\GAME_FILE\img\chart_features.png', dpi=150)
plt.close()
print("Saved chart_features.png")

# ── CHART 3: Overfitting Gap ───────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(7, 4))
gaps = [results[n]['train_acc'] - results[n]['test_acc'] for n in names]
colors = ['#ff6b6b' if g > 5 else '#69b578' for g in gaps]
ax.bar(names, gaps, color=colors)
ax.set_ylabel('Train − Test Accuracy (%)', fontsize=11)
ax.set_title('Overfitting Gap by Model', fontsize=13, fontweight='bold')
ax.yaxis.grid(True, alpha=0.3)
ax.set_axisbelow(True)
for i, (name, gap) in enumerate(zip(names, gaps)):
    ax.text(i, gap + 0.1, f'{gap:.1f}%', ha='center', va='bottom', fontsize=10)
plt.tight_layout()
plt.savefig(r'C:\Users\dennis.pezan\Downloads\GAME_FILE\img\chart_overfit.png', dpi=150)
plt.close()
print("Saved chart_overfit.png")

# ── CHART 4: Accuracy vs Number of Trees (Bagging & RF) ──────────────────────
# Decision Tree is a single tree by definition — not applicable here.
TREE_COUNTS = [1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 75, 100]
bag_scores, rf_scores = [], []

for n in TREE_COUNTS:
    b = BaggingClassifier(estimator=DecisionTreeClassifier(max_depth=5),
                          n_estimators=n, random_state=42)
    b.fit(X_train, y_train)
    bag_scores.append(round(accuracy_score(y_test, b.predict(X_test)) * 100, 2))

    r = RandomForestClassifier(n_estimators=n, max_depth=5, random_state=42)
    r.fit(X_train, y_train)
    rf_scores.append(round(accuracy_score(y_test, r.predict(X_test)) * 100, 2))

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(TREE_COUNTS, bag_scores, color='#4a7fa0', linewidth=2,
        marker='o', markersize=4, label='Bagging')
ax.plot(TREE_COUNTS, rf_scores,  color='#C9A84C', linewidth=2,
        marker='o', markersize=4, label='Random Forest')

ax.set_xlabel('Number of Trees', fontsize=11)
ax.set_ylabel('Test Accuracy (%)', fontsize=11)
ax.set_title('Test Accuracy vs Number of Trees', fontsize=13, fontweight='bold')
ax.set_ylim(60, 100)
ax.legend(fontsize=10)
ax.yaxis.grid(True, alpha=0.3)
ax.xaxis.grid(True, alpha=0.15)
ax.set_axisbelow(True)
plt.tight_layout()
plt.savefig(r'C:\Users\dennis.pezan\Downloads\GAME_FILE\img\chart_trees.png', dpi=150)
plt.close()
print("Saved chart_trees.png")

# ── SAVE RESULTS JSON ─────────────────────────────────────────────────────────
with open(r'C:\Users\dennis.pezan\Downloads\GAME_FILE\titanic_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("\n── RESULTS ──")
for name, r in results.items():
    print(f"{name}: Test={r['test_acc']}%  CV={r['cv_mean']}±{r['cv_std']}%")
