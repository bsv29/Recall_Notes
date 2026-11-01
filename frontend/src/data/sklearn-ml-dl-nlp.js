export const C_SK = [
{id:"sk-basics", t:"The estimator API", lvl:"B",
 hook:"fit learns, predict answers, transform reshapes.",
 sum:"scikit-learn gives every model the same simple interface.",
 pts:[
  "Estimators: `model.fit(X_train, y_train)`, then `model.predict(X_test)`.",
  "Transformers: `fit` learns parameters, `transform` applies them; `fit_transform` does both.",
  "`X` is 2D (samples × features); `y` is 1D.",
  "Split data: `train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)`.",
  "Score with `model.score(X_test, y_test)` or metrics like `accuracy_score`.",
  "Fit scalers on training data only, then transform the test data."
 ],
 code:`from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)           # no fit on test data
model = LogisticRegression(max_iter=1000).fit(X_train, y_train)
print(model.score(X_test, y_test))`,
 traps:["Calling `fit_transform` on the test set leaks information.","A 1D array as X raises an error; reshape it to `(-1, 1)`."],
 cards:[["fit vs transform vs fit_transform?","fit learns parameters; transform applies them; fit_transform does both (on training data only)."],["Shapes of X and y?","X: (n_samples, n_features); y: (n_samples,)."],["Why stratify?","Keeps class proportions the same in train and test."]],
 quiz:[["Scale the test data with…",["fit_transform","transform","fit","predict"],1,"Use the statistics learned on train."],["Keep class balance in the split:",["shuffle=False","stratify=y","random_state","test_size"],1,"stratify."]],
 vis:{type:"flow", steps:["Raw X, y","train_test_split","scaler.fit_transform(train)","model.fit(train)","predict(test) → score"]},
 prac:[{type:"bug", lines:["scaler = StandardScaler()","X_train = scaler.fit_transform(X_train)","X_test = scaler.fit_transform(X_test)"], bug:2, fix:"X_test = scaler.transform(X_test)", explain:"Refitting on the test set leaks information. Only transform it."}]},
{id:"sk-pipe", t:"Preprocessing & pipelines", lvl:"I",
 hook:"Put every step in a Pipeline and leakage disappears.",
 sum:"Chain preprocessing and models so they’re always applied the same way.",
 pts:[
  "Scaling: `StandardScaler` (mean 0, std 1) or `MinMaxScaler` (0 to 1).",
  "Encoding: `OneHotEncoder(handle_unknown='ignore')` for categories; `OrdinalEncoder` for ordered ones.",
  "Missing values: `SimpleImputer(strategy='median')`.",
  "`ColumnTransformer` applies different steps to numeric and categorical columns.",
  "`Pipeline` chains the steps; `fit` runs them in order on training data only.",
  "Pipelines work inside cross-validation and grid search."
 ],
 code:`from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier

num = Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())])
pre = ColumnTransformer([
    ("num", num, ["age", "income"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"]),
])
clf = Pipeline([("pre", pre), ("model", RandomForestClassifier(random_state=0))])
clf.fit(X_train, y_train)
print(clf.score(X_test, y_test))`,
 traps:["Encoding categories as plain integers implies a fake order.","Tree models don’t need scaling; distance-based ones (KNN, SVM) do."],
 cards:[["Why use a Pipeline?","It applies the same steps at training and prediction time and prevents leakage in CV."],["What does ColumnTransformer do?","Applies different preprocessing to different columns."],["One-hot vs ordinal encoding?","One-hot makes binary columns with no order; ordinal maps to integers that imply an order."]],
 quiz:[["Which models need feature scaling most?",["Random forest","KNN and SVM","Decision tree","Gradient boosting"],1,"Distance-based models."],["Handle unseen categories at prediction time:",["handle_unknown='ignore'","drop='first'","sparse_output=False","dtype=int"],0,"ignore."]],
 vis:{type:"flow", steps:["Raw DataFrame","Impute + scale numbers","One-hot categories","Model","Predictions"]},
 prac:[{type:"order", lines:["pre = ColumnTransformer([...])","clf = Pipeline([(\"pre\", pre), (\"model\", model)])","clf.fit(X_train, y_train)","clf.predict(X_test)"], explain:"Define preprocessing, wrap it with the model, fit, then predict."}]},
{id:"sk-models", t:"Common models", lvl:"I",
 hook:"Start simple: linear first, trees next, ensembles to win.",
 sum:"What each classic model does and when to reach for it.",
 pts:[
  "**Linear and logistic regression:** fast, interpretable baselines.",
  "**KNN:** predicts from the nearest neighbors; needs scaling; slow on big data.",
  "**Decision tree:** if/else splits; easy to explain but overfits.",
  "**Random forest:** many trees on bootstrapped samples (bagging) → lower variance.",
  "**Gradient boosting** (XGBoost, LightGBM): trees that fix the previous trees’ errors; very strong on tabular data.",
  "**SVM:** maximum-margin boundary, kernels for non-linear data. **K-Means:** unsupervised clustering."
 ],
 code:`from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

models = {
    "logreg": LogisticRegression(max_iter=1000),
    "forest": RandomForestClassifier(n_estimators=200, random_state=0),
    "boost": GradientBoostingClassifier(random_state=0),
}
for name, m in models.items():
    scores = cross_val_score(m, X, y, cv=5, scoring="f1")
    print(name, scores.mean().round(3))`,
 traps:["One deep tree memorizes the training data.","Comparing models on a single random split is noisy; use cross-validation."],
 cards:[["Bagging vs boosting?","Bagging trains models in parallel on samples (random forest); boosting trains them one after another on errors."],["Why does KNN need scaling?","It uses distances, so large-range features dominate."],["Good first model for tabular classification?","A logistic regression baseline, then a tree ensemble."]],
 quiz:[["Random forest mainly reduces…",["bias","variance","data size","features"],1,"Averaging many trees reduces variance."],["Unsupervised clustering:",["KNN","K-Means","SVM","Logistic regression"],1,"K-Means."]],
 vis:{type:"tree", root:"Supervised models", kids:[{n:"Linear", k:["Linear regression","Logistic regression"]},{n:"Trees", k:["Decision tree","Random forest","Gradient boosting"]},{n:"Other", k:["KNN","SVM"]}]},
 prac:[{type:"blank", code:"scores = ____(model, X, y, cv=5)\nprint(scores.mean())", answer:["cross_val_score"], explain:"`cross_val_score` runs k-fold cross-validation."}]},
{id:"sk-eval", t:"Evaluation & tuning", lvl:"A",
 hook:"Tune on validation folds; report on the untouched test set.",
 sum:"Measure models correctly and tune hyperparameters without fooling yourself.",
 pts:[
  "Classification: accuracy, precision, recall, F1, ROC-AUC; `classification_report`, `confusion_matrix`.",
  "Regression: MAE, MSE, RMSE, R².",
  "K-fold cross-validation (`cv=5`); `StratifiedKFold` for classification.",
  "`GridSearchCV` and `RandomizedSearchCV` tune hyperparameters with cross-validation.",
  "Imbalanced data: `class_weight='balanced'`, resampling, PR-AUC.",
  "Learning curves tell underfitting apart from overfitting."
 ],
 code:`from sklearn.model_selection import GridSearchCV
from sklearn.metrics import classification_report

grid = GridSearchCV(
    RandomForestClassifier(random_state=0, class_weight="balanced"),
    param_grid={"n_estimators": [100, 300], "max_depth": [None, 8, 16]},
    cv=5, scoring="f1", n_jobs=-1,
)
grid.fit(X_train, y_train)
print(grid.best_params_)
print(classification_report(y_test, grid.predict(X_test)))`,
 traps:["Tuning on the test set gives over-optimistic scores.","Accuracy on imbalanced data is misleading."],
 cards:[["Precision vs recall?","Precision: of the predicted positives, how many are right. Recall: of the actual positives, how many were found."],["What does GridSearchCV do?","Tries every parameter combination with cross-validation and keeps the best."],["Metric for imbalanced classes?","F1, PR-AUC or ROC-AUC rather than accuracy."]],
 quiz:[["Missing a cancer case is the worst error; optimize…",["precision","recall","accuracy","R²"],1,"Catch every positive."],["An R² of 1 means…",["no fit","a perfect fit","always overfit","an error"],1,"It explains all the variance."]],
 vis:{type:"grid", rows:2, cols:2, labels:["TN (correct no)","FP (false alarm)","FN (missed)","TP (correct yes)"]},
 prac:[{type:"predict", code:"from sklearn.metrics import precision_score\nprint(precision_score([1, 0, 1, 1], [1, 1, 1, 0]))", answer:["0.6666666666666666","0.667","2/3"], explain:"3 predicted positives, 2 of them correct: 2/3."}]}
];

export const C_ML = [
{id:"ml-basics", t:"ML fundamentals", lvl:"B",
 hook:"Learn patterns from data; judge on data the model hasn’t seen.",
 sum:"The core ideas behind every machine learning project.",
 pts:[
  "**Supervised** (labeled: classification, regression), **unsupervised** (clustering, dimensionality reduction), **reinforcement** (rewards).",
  "Features (X) are the inputs; the label or target (y) is what you predict.",
  "Train / validation / test: fit, tune, then report once.",
  "**Overfitting:** great on training data, poor on new data. **Underfitting:** poor on both.",
  "**Bias-variance trade-off:** simple models have high bias; complex models have high variance.",
  "Workflow: problem → data → EDA → features → model → evaluate → deploy → monitor."
 ],
 code:`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
model = RandomForestClassifier(random_state=0).fit(X_tr, y_tr)
print("train", model.score(X_tr, y_tr))   # close to 1.0
print("test ", model.score(X_te, y_te))   # lower: the honest number`,
 traps:["Reporting training accuracy as the model’s performance.","Letting test data leak into preprocessing or feature selection."],
 cards:[["Classification vs regression?","Classification predicts categories; regression predicts numbers."],["Ways to fix overfitting?","More data, regularization, a simpler model, dropout, early stopping, augmentation."],["Bias vs variance?","Bias: error from oversimplifying. Variance: error from being too sensitive to the training data."]],
 quiz:[["Predicting house prices is…",["classification","regression","clustering","reinforcement learning"],1,"A continuous target."],["Train 99%, test 70% suggests…",["underfitting","overfitting","a good fit","nothing"],1,"High variance."]],
 vis:{type:"compare", cols:[{h:"Underfit", items:["too simple","high bias","bad on train and test"]},{h:"Good fit", items:["captures the pattern","similar train and test scores"]},{h:"Overfit", items:["memorizes noise","high variance","great train, poor test"]}]},
 prac:[{type:"order", lines:["Define the problem and the metric","Collect and clean the data","Explore and engineer features","Train and tune models","Evaluate on the test set","Deploy and monitor"], explain:"The standard ML project lifecycle."}]},
{id:"ml-reg", t:"Linear & logistic regression", lvl:"I",
 hook:"Linear predicts a number; logistic squeezes it into a probability.",
 sum:"The two foundational models and the math interviewers ask about.",
 pts:[
  "Linear regression: `ŷ = w·x + b`, trained by minimizing mean squared error.",
  "Logistic regression: `p = sigmoid(w·x + b)`, trained with log loss (binary cross-entropy).",
  "Gradient descent: `w ← w − lr · ∂loss/∂w`, repeated until the loss stops falling.",
  "Regularization: **L1 (Lasso)** pushes weights to zero; **L2 (Ridge)** shrinks them.",
  "Coefficients show each feature’s effect once features are scaled.",
  "Linear regression assumes linearity, independent errors, constant variance and roughly normal residuals."
 ],
 code:`import numpy as np
X = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.0, 5.0, 7.0, 9.0])           # y = 2x + 1
w, b, lr = 0.0, 0.0, 0.05
for _ in range(2000):
    err = (w * X + b) - y
    w -= lr * 2 * (err * X).mean()
    b -= lr * 2 * err.mean()
print(round(w, 2), round(b, 2))               # 2.0 1.0`,
 traps:["Using linear regression for classification gives ‘probabilities’ outside 0–1.","Unscaled features make gradient descent slow and coefficients incomparable."],
 cards:[["Loss for linear vs logistic regression?","Linear: MSE. Logistic: log loss (binary cross-entropy)."],["L1 vs L2?","L1 can set weights to exactly zero (feature selection); L2 shrinks all weights smoothly."],["What does sigmoid do?","Maps any number to a probability between 0 and 1."]],
 quiz:[["Lasso uses…",["L1","L2","dropout","boosting"],0,"An L1 penalty."],["Logistic regression outputs…",["a class only","a probability","a cluster","a vector"],1,"A probability via sigmoid."]],
 vis:{type:"flow", steps:["features x","w·x + b","sigmoid","probability p","p > 0.5 → class 1"]},
 prac:[{type:"predict", code:"import math\nprint(round(1 / (1 + math.exp(0)), 2))", answer:["0.5"], explain:"sigmoid(0) = 0.5."}]},
{id:"ml-trees", t:"Trees, ensembles & clustering", lvl:"I",
 hook:"One tree overfits; a forest votes; boosting learns from mistakes.",
 sum:"Tree models dominate tabular data; clustering and PCA find structure without labels.",
 pts:[
  "Decision trees split on features to reduce impurity (Gini or entropy).",
  "Random forest = bagging + random feature subsets → robust and low-variance.",
  "Boosting (AdaBoost, gradient boosting, XGBoost) adds trees one by one to fix residual errors.",
  "Tree feature importance helps explain models; permutation importance is more reliable.",
  "K-Means: assign points to the nearest centroid, move centroids, repeat; choose k with the elbow or silhouette score.",
  "PCA reduces dimensions by projecting onto the directions of maximum variance."
 ],
 code:`from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X_scaled)
labels = km.labels_
print(km.inertia_)                    # within-cluster sum of squares

pca = PCA(n_components=2)
X2 = pca.fit_transform(X_scaled)
print(pca.explained_variance_ratio_)  # variance kept per component`,
 traps:["K-Means needs scaled features and assumes round clusters.","Impurity-based importance favors features with many unique values."],
 cards:[["What does Gini impurity measure?","How mixed the classes are in a node (0 = pure)."],["How does K-Means work?","Assign points to the nearest centroid, recompute centroids, repeat until stable."],["What is PCA?","Projecting data onto orthogonal directions of maximum variance to reduce dimensions."]],
 quiz:[["Choose k for K-Means with…",["the elbow or silhouette score","accuracy","R²","ROC-AUC"],0,"There are no labels, so use those."],["Boosting trains trees…",["in parallel","one after another on errors","without data","randomly only"],1,"Sequentially."]],
 vis:{type:"cycle", steps:["Pick k centroids","Assign points to the nearest centroid","Move centroids to cluster means","Repeat until stable"]},
 prac:[{type:"order", lines:["Choose k starting centroids","Assign each point to its nearest centroid","Recompute each centroid as its points’ mean","Repeat until assignments stop changing"], explain:"The K-Means loop."}]},
{id:"ml-prod", t:"Feature engineering & ML in production", lvl:"A",
 hook:"Better features beat fancier models.",
 sum:"Turn raw data into signal, handle real-world problems, and ship models responsibly.",
 pts:[
  "Feature engineering: dates → day/month/weekday, text → counts or TF-IDF, ratios, per-group aggregates.",
  "Imbalanced classes: class weights, SMOTE, threshold tuning.",
  "Data leakage: features that wouldn’t exist at prediction time; split time series by time.",
  "Explainability: SHAP values, permutation importance, partial dependence plots.",
  "Deployment: save with `joblib`, serve with FastAPI, track experiments with MLflow.",
  "Monitoring: watch for data drift and concept drift; retrain on fresh data."
 ],
 code:`import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

model = joblib.load("model.joblib")       # a fitted Pipeline
app = FastAPI()

class Applicant(BaseModel):
    age: int
    income: float
    city: str

@app.post("/predict")
def predict(a: Applicant):
    X = pd.DataFrame([a.model_dump()])
    return {"approve_prob": float(model.predict_proba(X)[0, 1])}`,
 traps:["Random splits on time series leak the future into training.","Features built using the target (target leakage) inflate scores."],
 cards:[["Data drift vs concept drift?","Data drift: the input distribution changes. Concept drift: the relationship between inputs and target changes."],["What does SHAP show?","Each feature’s contribution to an individual prediction."],["How do you split time-series data?","By time: train on the past, validate on later periods."]],
 quiz:[["Save a scikit-learn pipeline:",["df.to_csv","joblib.dump","torch.save","json.dump"],1,"joblib."],["Accuracy drops months after launch; first suspect:",["drift","the GPU","the Python version","fonts"],0,"Data or concept drift."]],
 vis:{type:"cycle", steps:["Train + validate","Deploy as an API","Monitor data and metrics","Drift detected → retrain"]},
 prac:[{type:"bug", lines:["df = df.sort_values('date')","X_train, X_test = train_test_split(X, shuffle=True)","model.fit(X_train, y_train)"], bug:1, fix:"X_train, X_test = X[:cut], X[cut:]   # split by time", explain:"Shuffling time-series data leaks the future into training."}]}
];

export const C_DL = [
{id:"dl-basics", t:"Neurons, layers & activations", lvl:"B",
 hook:"Weighted sum, add bias, squash. Stack it deep.",
 sum:"Neural networks are layers of simple units that learn features from data.",
 pts:[
  "A neuron computes `z = w·x + b`, then an activation `a = f(z)`.",
  "Layers: input → hidden → output; depth lets networks learn features in layers.",
  "Activations add non-linearity: ReLU (hidden layers), sigmoid (binary output), softmax (multi-class output), tanh, GELU.",
  "Without activations, stacked layers collapse into one linear function.",
  "Output and loss pairs: regression → linear + MSE; binary → sigmoid + BCE; multi-class → softmax + cross-entropy.",
  "Parameters in `nn.Linear(in, out)` = in × out + out."
 ],
 code:`import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(4, 16), nn.ReLU(),
    nn.Linear(16, 16), nn.ReLU(),
    nn.Linear(16, 3),                 # logits for 3 classes
)
x = torch.rand(8, 4)
probs = model(x).softmax(dim=1)
print(probs.shape)                    # torch.Size([8, 3])`,
 traps:["Applying softmax before `CrossEntropyLoss` softmaxes twice.","Sigmoid in deep hidden layers causes vanishing gradients."],
 cards:[["Why non-linear activations?","Otherwise the whole network is one linear transformation."],["ReLU formula?","max(0, x)."],["What does softmax output?","Probabilities that sum to 1 across classes."]],
 quiz:[["Default activation for hidden layers:",["sigmoid","ReLU","softmax","linear"],1,"ReLU."],["Parameters in nn.Linear(4, 16):",["64","80","20","16"],1,"4 × 16 weights + 16 biases."]],
 vis:{type:"flow", steps:["inputs x","× weights + bias","activation (ReLU)","next layer","softmax → probabilities"]},
 prac:[{type:"predict", code:"import torch.nn as nn\nlayer = nn.Linear(10, 5)\nprint(sum(p.numel() for p in layer.parameters()))", answer:["55"], explain:"10 × 5 weights + 5 biases = 55."}]},
{id:"dl-train", t:"Loss, backprop & optimizers", lvl:"I",
 hook:"Forward to predict, backward to assign blame, step to improve.",
 sum:"How networks learn: loss functions, backpropagation and gradient-based optimizers.",
 pts:[
  "The loss measures error; backprop applies the chain rule to get every weight’s gradient.",
  "Optimizers: SGD (+ momentum), Adam (adaptive per-parameter rates), AdamW (decoupled weight decay).",
  "The learning rate matters most; schedulers change it during training.",
  "Mini-batches balance speed and gradient noise; one epoch is one pass over the data.",
  "Initialization (He for ReLU, Xavier for tanh) keeps signals stable through layers.",
  "Training step: zero_grad → forward → loss → backward → step."
 ],
 code:`opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=20)
loss_fn = nn.CrossEntropyLoss()
for epoch in range(20):
    model.train()
    for xb, yb in train_loader:
        opt.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        opt.step()
    sched.step()`,
 traps:["Too high a learning rate makes the loss explode or oscillate.","Forgetting `zero_grad` adds up gradients across batches."],
 cards:[["SGD vs Adam?","SGD uses one learning rate; Adam adapts it per parameter using running averages of gradients."],["Epoch vs batch vs iteration?","Epoch: a full pass; batch: a subset; iteration: one weight update."],["What is backpropagation?","Computing the loss gradient for every weight with the chain rule, from the output backwards."]],
 quiz:[["The loss becomes NaN after a few steps. Try first:",["more epochs","a lower learning rate","a bigger batch","deleting data"],1,"Reduce the learning rate."],["Order of a training step:",["step, backward, zero_grad","zero_grad, forward, backward, step","forward, step, backward","backward, forward, step"],1,"The standard order."]],
 vis:{type:"cycle", steps:["Forward pass → predictions","Loss vs targets","Backward → gradients","Optimizer step → new weights"]},
 prac:[{type:"order", lines:["opt.zero_grad()","out = model(xb)","loss = loss_fn(out, yb)","loss.backward()","opt.step()"], explain:"Clear gradients, forward, loss, backward, update."}]},
{id:"dl-reg", t:"Overfitting & regularization", lvl:"I",
 hook:"Make the network’s job harder so it learns to generalize.",
 sum:"Techniques that stop deep networks from memorizing the training set.",
 pts:[
  "Dropout randomly zeroes activations during training and is turned off by `model.eval()`.",
  "Weight decay (L2) penalizes large weights.",
  "Batch normalization stabilizes training; layer normalization is used in transformers.",
  "Data augmentation (flips, crops, noise) creates more varied training examples.",
  "Early stopping halts training when validation loss stops improving.",
  "Vanishing or exploding gradients: use ReLU, good initialization, normalization, residual connections, gradient clipping."
 ],
 code:`model = nn.Sequential(
    nn.Linear(64, 128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(128, 10),
)
best, patience, bad = float("inf"), 3, 0
for epoch in range(100):
    train_one_epoch(model)
    val = evaluate(model)            # uses model.eval() and no_grad
    if val < best:
        best, bad = val, 0
        torch.save(model.state_dict(), "best.pt")
    else:
        bad += 1
        if bad >= patience:
            break`,
 traps:["Evaluating without `model.eval()` keeps dropout on and gives noisy scores.","Augmenting the validation set makes it unrepresentative."],
 cards:[["How does dropout prevent overfitting?","Units can’t rely on each other because random ones are dropped every step."],["What is early stopping?","Stopping when validation loss stops improving and keeping the best weights."],["How do you fix exploding gradients?","Gradient clipping, a lower learning rate, normalization, better initialization."]],
 quiz:[["Dropout during evaluation is…",["on","off","doubled","random"],1,"model.eval() turns it off."],["Residual connections mainly help with…",["vanishing gradients","data loading","tokenization","colors"],0,"Gradients flow through the skip connections."]],
 vis:{type:"compare", cols:[{h:"Train ↓, validation ↑", items:["overfitting","add dropout, weight decay, data"]},{h:"Both high", items:["underfitting","bigger model, train longer"]},{h:"Both low and close", items:["good fit"]}]},
 prac:[{type:"blank", code:"model.____()          # turn off dropout for testing\nwith torch.no_grad():\n    preds = model(x_test)", answer:["eval"], explain:"`model.eval()` switches dropout and batch norm to inference mode."}]},
{id:"dl-arch", t:"CNNs, RNNs & transfer learning", lvl:"A",
 hook:"CNNs see local patterns; RNNs read in order; transformers look at everything.",
 sum:"The main architectures and how to reuse pretrained models.",
 pts:[
  "CNN: convolution filters with shared weights detect local patterns; pooling downsamples; ideal for images.",
  "Conv output size: `(W − K + 2P) / S + 1`.",
  "RNN, LSTM and GRU process sequences step by step; LSTM gates fight vanishing gradients.",
  "Transformers replaced RNNs for most sequence tasks thanks to self-attention and parallel training.",
  "Transfer learning: load a pretrained model (ResNet, BERT), freeze early layers, train a new head, then fine-tune.",
  "ResNet’s skip connections made very deep networks trainable."
 ],
 code:`import torchvision
model = torchvision.models.resnet18(weights="IMAGENET1K_V1")
for p in model.parameters():
    p.requires_grad = False                    # freeze the backbone
model.fc = nn.Linear(model.fc.in_features, 5)  # new head for 5 classes
opt = torch.optim.Adam(model.fc.parameters(), lr=1e-3)

conv = nn.Conv2d(3, 16, kernel_size=3, padding=1)
print(conv(torch.rand(1, 3, 32, 32)).shape)    # torch.Size([1, 16, 32, 32])`,
 traps:["Skipping the pretrained model’s input normalization hurts accuracy.","Fine-tuning everything with a high learning rate destroys pretrained features."],
 cards:[["Why CNNs for images?","Local filters with shared weights capture patterns with few parameters."],["Conv output size formula?","(W − K + 2P) / S + 1."],["Steps of transfer learning?","Load pretrained, freeze, replace the head, train it, optionally unfreeze and fine-tune with a small LR."]],
 quiz:[["32×32 input, 3×3 kernel, no padding, stride 1 → output size",["32","30","31","34"],1,"(32 − 3 + 0) / 1 + 1 = 30."],["LSTM gates help with…",["vanishing gradients","image size","tokenization","sorting"],0,"They keep long-term information."]],
 vis:{type:"flow", steps:["Image 3×224×224","Conv + ReLU","Pooling","More conv blocks","Flatten","Linear → class scores"]},
 prac:[{type:"predict", code:"conv = nn.Conv2d(1, 4, kernel_size=5)\nprint(conv(torch.rand(1, 1, 28, 28)).shape)", answer:["torch.Size([1, 4, 24, 24])"], explain:"28 − 5 + 1 = 24 with no padding."}]}
];

export const C_NLP = [
{id:"nlp-basics", t:"Text preprocessing", lvl:"B",
 hook:"Machines read numbers: clean, split, then count.",
 sum:"Turn raw text into clean tokens that models can use.",
 pts:[
  "Pipeline: lowercase → remove noise (URLs, HTML) → tokenize → remove stopwords (sometimes) → stem or lemmatize.",
  "**Tokenization** splits text into words, subwords or characters.",
  "**Stemming** chops suffixes (`studies → studi`); **lemmatization** uses a dictionary (`studies → study`).",
  "Stopwords (the, is) add little to bag-of-words models but matter for transformers.",
  "Libraries: NLTK, spaCy, Hugging Face tokenizers.",
  "Regular expressions clean text: `re.sub(r'http\\S+', '', text)`."
 ],
 code:`import re
import spacy
nlp = spacy.load("en_core_web_sm")

text = "Loving the new phones!! Check https://x.co #tech"
clean = re.sub(r"http\\S+|#\\w+", "", text.lower())
doc = nlp(clean)
tokens = [t.lemma_ for t in doc if t.is_alpha and not t.is_stop]
print(tokens)          # ['love', 'new', 'phone', 'check']`,
 traps:["Removing stopwords like ‘not’ can flip sentiment.","Stemming produces non-words; lemmatization is slower but cleaner."],
 cards:[["Stemming vs lemmatization?","Stemming cuts suffixes by rules; lemmatization returns the dictionary form using vocabulary and part of speech."],["What is tokenization?","Splitting text into units: words, subwords or characters."],["When should you keep stopwords?","For transformers and tasks where words like ‘not’ change the meaning."]],
 quiz:[["Lemma of ‘better’ (adjective):",["better","good","bett","best"],1,"Lemmatization uses vocabulary."],["Splitting text into units is called…",["stemming","tokenization","embedding","parsing"],1,"Tokenization."]],
 vis:{type:"flow", steps:["Raw text","Lowercase + clean","Tokenize","Drop stopwords","Lemmatize","Tokens"]},
 prac:[{type:"predict", code:"text = \"NLP is FUN\"\nprint(text.lower().split())", answer:["['nlp', 'is', 'fun']"], explain:"Lowercase, then split on spaces."}]},
{id:"nlp-vec", t:"Bag of words, TF-IDF & embeddings", lvl:"I",
 hook:"Count words, weight the rare ones, then learn meaning as vectors.",
 sum:"Represent text as numbers, from simple counts to dense learned embeddings.",
 pts:[
  "**Bag of words** counts each word and ignores order (`CountVectorizer`).",
  "**TF-IDF** = term frequency × inverse document frequency; common words get low weight.",
  "N-grams (`ngram_range=(1, 2)`) capture short phrases like ‘not good’.",
  "**Word embeddings** (Word2Vec, GloVe) are dense vectors where similar words sit close together.",
  "Contextual embeddings (BERT) give the same word different vectors in different sentences.",
  "Cosine similarity compares vectors by angle."
 ],
 code:`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

docs = ["great phone, love it", "terrible battery", "not good, not great"]
labels = [1, 0, 0]
vec = TfidfVectorizer(ngram_range=(1, 2))
X = vec.fit_transform(docs)               # sparse matrix
clf = LogisticRegression().fit(X, labels)
print(X.shape, clf.predict(vec.transform(["love the battery"])))`,
 traps:["Fitting the vectorizer on test text leaks vocabulary.","Bag of words can’t tell ‘dog bites man’ from ‘man bites dog’."],
 cards:[["What does IDF do?","Lowers the weight of words that appear in many documents."],["Static vs contextual embeddings?","Static: one vector per word (Word2Vec). Contextual: depends on the sentence (BERT)."],["Why use n-grams?","To capture phrases such as ‘not good’."]],
 quiz:[["A word in every document gets a TF-IDF weight that is…",["high","near zero","negative","random"],1,"Its IDF is about 0."],["Compare two embeddings with…",["cosine similarity","accuracy","Gini","R²"],0,"Angle-based similarity."]],
 vis:{type:"compare", cols:[{h:"Bag of words", items:["counts","sparse","no order"]},{h:"TF-IDF", items:["weighted counts","sparse","rare words matter more"]},{h:"Embeddings", items:["dense vectors","capture meaning","king − man + woman ≈ queen"]}]},
 prac:[{type:"blank", code:"vec = TfidfVectorizer()\nX = vec.____(train_docs)\nX_test = vec.transform(test_docs)", answer:["fit_transform"], explain:"Learn the vocabulary on training text only."}]},
{id:"nlp-tasks", t:"Core NLP tasks", lvl:"I",
 hook:"Classify it, tag it, extract it, generate it.",
 sum:"The common tasks NLP systems solve and how each is measured.",
 pts:[
  "Text classification: sentiment, spam, intent.",
  "Named entity recognition (NER): tag people, organizations, places.",
  "Part-of-speech tagging and dependency parsing describe grammar.",
  "Sequence-to-sequence: translation and summarization.",
  "Question answering and semantic search rely on embeddings.",
  "Metrics: accuracy/F1 (classification), entity-level F1 (NER), BLEU/ROUGE (generation)."
 ],
 code:`from transformers import pipeline

sentiment = pipeline("sentiment-analysis")
print(sentiment("The battery life is amazing")[0]["label"])   # POSITIVE

ner = pipeline("ner", aggregation_strategy="simple")
for ent in ner("Sundar Pichai leads Google in Mountain View"):
    print(ent["entity_group"], ent["word"])                    # PER, ORG, LOC`,
 traps:["Accuracy hides poor results on rare classes; check per-class F1.","ROUGE rewards word overlap, not factual correctness."],
 cards:[["What is NER?","Finding and labeling named entities such as people, organizations and locations."],["BLEU vs ROUGE?","BLEU measures n-gram precision (translation); ROUGE measures n-gram recall (summaries)."],["An example of seq2seq?","Translation or summarization."]],
 quiz:[["Detecting ‘Google’ as an organization:",["POS tagging","NER","stemming","TF-IDF"],1,"NER."],["Metric often used for summaries:",["ROUGE","R²","AUC","MAE"],0,"ROUGE."]],
 vis:{type:"tree", root:"NLP tasks", kids:[{n:"Understand", k:["classification","NER","question answering"]},{n:"Generate", k:["translation","summarization","chat"]}]},
 prac:[{type:"blank", code:"from transformers import pipeline\nclf = ____(\"sentiment-analysis\")\nprint(clf(\"I love it\"))", answer:["pipeline"], explain:"`pipeline` loads a ready model for a task."}]},
{id:"nlp-adv", t:"From RNNs to transformers", lvl:"A",
 hook:"RNNs remember step by step; attention looks at every word at once.",
 sum:"How NLP moved from recurrent models to attention, and how to fine-tune modern models.",
 pts:[
  "RNN and LSTM encoders read tokens in order; long-range dependencies are hard for them.",
  "Seq2seq with attention lets the decoder focus on the relevant input words.",
  "Transformers use only attention, train in parallel, and scale to huge data.",
  "Pretrain, then fine-tune: BERT (encoder, understanding), GPT (decoder, generation), T5 (encoder-decoder).",
  "Fine-tune with Hugging Face’s `Trainer` on labeled data.",
  "Subword tokenization (WordPiece, BPE) handles unknown words."
 ],
 code:`from transformers import AutoTokenizer, AutoModelForSequenceClassification

name = "distilbert-base-uncased"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(name, num_labels=2)

batch = tok(["great movie", "boring plot"], padding=True, truncation=True, return_tensors="pt")
out = model(**batch)
print(out.logits.shape)      # torch.Size([2, 2])`,
 traps:["Using a tokenizer from a different model than the weights breaks the inputs.","Long texts are silently cut at the max length (512 tokens for BERT)."],
 cards:[["BERT vs GPT?","BERT: a bidirectional encoder for understanding. GPT: a left-to-right decoder for generation."],["Why subword tokenization?","Rare or unknown words split into known pieces."],["Why did transformers beat RNNs?","Parallel training and direct attention between any two tokens."]],
 quiz:[["Best fit for fine-tuning a text classifier:",["Word2Vec","a BERT-style encoder","K-Means","a CNN for images"],1,"Encoders suit understanding tasks."],["BERT’s maximum sequence length:",["128","512","4096","unlimited"],1,"512 tokens."]],
 vis:{type:"compare", cols:[{h:"RNN / LSTM", items:["reads in sequence","weak long-range memory","slow to train"]},{h:"Transformer", items:["parallel","attention to every token","scales to huge data"]}]},
 prac:[{type:"blank", code:"tok = AutoTokenizer.from_pretrained(name)\nbatch = tok(texts, ____=True, truncation=True, return_tensors=\"pt\")", answer:["padding"], explain:"`padding=True` pads the batch to equal length."}]}
];
