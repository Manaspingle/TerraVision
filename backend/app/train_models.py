import os
import io
import struct
import joblib
import numpy as np
import cv2
from PIL import Image
from skimage.feature import graycomatrix, graycoprops
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, classification_report

EUROSAT_CLASSES = [
    "AnnualCrop", "Forest", "HerbaceousVegetation", "Highway", "Industrial",
    "Pasture", "PermanentCrop", "Residential", "River", "SeaLake"
]

def extract_features_from_image(img_np: np.ndarray) -> np.ndarray:
    """
    Extracts a 34-dimensional feature vector from an RGB image:
    - Channel color means and std devs (RGB & HSV)
    - Spatial intensity histogram (16 bins)
    - GLCM texture metrics (contrast, correlation, energy, homogeneity, entropy)
    - Edge density (Canny)
    """
    # 1. Resize to uniform size (64x64)
    img_resized = cv2.resize(img_np, (64, 64))
    hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    # 2. Color moments (Mean & Std Dev for BGR & HSV)
    b_mean, g_mean, r_mean = np.mean(img_resized, axis=(0, 1))
    b_std, g_std, r_std = np.std(img_resized, axis=(0, 1))
    h_mean, s_mean, v_mean = np.mean(hsv, axis=(0, 1))
    h_std, s_std, v_std = np.std(hsv, axis=(0, 1))
    
    # 3. Intensity histogram (16 bins)
    hist = cv2.calcHist([gray], [0], None, [16], [0, 256]).flatten()
    hist_norm = hist / (np.sum(hist) + 1e-6)
    
    # 4. GLCM Texture features
    gray_quantized = (gray // 16).astype(np.uint8)
    glcm = graycomatrix(gray_quantized, distances=[1], angles=[0], levels=16, symmetric=True, normed=True)
    contrast = float(graycoprops(glcm, 'contrast')[0, 0])
    correlation = float(graycoprops(glcm, 'correlation')[0, 0])
    energy = float(graycoprops(glcm, 'energy')[0, 0])
    homogeneity = float(graycoprops(glcm, 'homogeneity')[0, 0])
    
    # 5. Edge density
    edges = cv2.Canny(gray, 50, 150)
    edge_density = float(np.count_nonzero(edges) / (64 * 64))
    
    feature_vector = np.array([
        b_mean, g_mean, r_mean, b_std, g_std, r_std,
        h_mean, s_mean, v_mean, h_std, s_std, v_std,
        *hist_norm,
        contrast, correlation, energy, homogeneity, edge_density
    ], dtype=np.float32)
    
    return feature_vector

def load_eurosat_dataset(tfrecord_path: str, max_samples: int = 5000):
    """
    Parses EuroSAT TFRecord file and extracts feature vectors & labels.
    """
    X = []
    y = []
    count = 0
    
    with open(tfrecord_path, 'rb') as f:
        while count < max_samples:
            header = f.read(8)
            if not header or len(header) < 8:
                break
            length = struct.unpack('<Q', header)[0]
            f.read(4) # crc
            data = f.read(length)
            f.read(4) # crc
            
            # Extract Label
            lbl_idx = data.find(b'label')
            if lbl_idx == -1:
                continue
            label = data[lbl_idx + 11]
            if label >= 10:
                continue
                
            # Extract Image bytes
            jpg_start = data.find(b'\xff\xd8')
            jpg_end = data.rfind(b'\xff\xd9')
            if jpg_start != -1 and jpg_end != -1:
                jpg_bytes = data[jpg_start:jpg_end+2]
                try:
                    pil_img = Image.open(io.BytesIO(jpg_bytes)).convert('RGB')
                    cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
                    feat = extract_features_from_image(cv_img)
                    X.append(feat)
                    y.append(label)
                    count += 1
                except Exception:
                    pass

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64)

def train_and_save_models(dataset_path: str, output_model_dir: str):
    print(f"Loading EuroSAT dataset from {dataset_path}...")
    X, y = load_eurosat_dataset(dataset_path, max_samples=4000)
    print(f"Loaded {len(X)} samples across {len(np.unique(y))} classes.")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {}
    eval_metrics = {}
    
    # 1. K-Nearest Neighbors
    print("Training K-NN Classifier...")
    knn = KNeighborsClassifier(n_neighbors=5, weights='distance')
    knn.fit(X_train_scaled, y_train)
    y_pred_knn = knn.predict(X_test_scaled)
    acc_knn = accuracy_score(y_test, y_pred_knn)
    models['knn'] = knn
    eval_metrics['knn'] = {"accuracy": round(float(acc_knn) * 100, 2), "params": "K=5, Euclidean Distance"}
    print(f"K-NN Accuracy: {acc_knn*100:.2f}%")
    
    # 2. Support Vector Machine (SVM)
    print("Training Support Vector Machine (SVM)...")
    svm = SVC(kernel='rbf', C=2.0, probability=True, random_state=42)
    svm.fit(X_train_scaled, y_train)
    y_pred_svm = svm.predict(X_test_scaled)
    acc_svm = accuracy_score(y_test, y_pred_svm)
    models['svm'] = svm
    eval_metrics['svm'] = {"accuracy": round(float(acc_svm) * 100, 2), "kernel": "RBF Kernel (C=2.0)"}
    print(f"SVM Accuracy: {acc_svm*100:.2f}%")
    
    # 3. Decision Tree Classifier
    print("Training Decision Tree Classifier...")
    dt = DecisionTreeClassifier(max_depth=12, random_state=42)
    dt.fit(X_train_scaled, y_train)
    y_pred_dt = dt.predict(X_test_scaled)
    acc_dt = accuracy_score(y_test, y_pred_dt)
    models['decision_tree'] = dt
    eval_metrics['decision_tree'] = {"accuracy": round(float(acc_dt) * 100, 2), "max_depth": 12, "criterion": "Gini"}
    print(f"Decision Tree Accuracy: {acc_dt*100:.2f}%")
    
    # 4. Neural Network / Multi-Layer Perceptron (MLP) Classifier
    print("Training Neural Network (MLP Classifier)...")
    mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=200, random_state=42)
    mlp.fit(X_train_scaled, y_train)
    y_pred_mlp = mlp.predict(X_test_scaled)
    acc_mlp = accuracy_score(y_test, y_pred_mlp)
    models['cnn_mlp'] = mlp
    eval_metrics['cnn_mlp'] = {"accuracy": round(float(acc_mlp) * 100, 2), "architecture": "MLP (128x64) Softmax"}
    print(f"Neural Network Accuracy: {acc_mlp*100:.2f}%")
    
    os.makedirs(output_model_dir, exist_ok=True)
    save_path = os.path.join(output_model_dir, "eurosat_models.joblib")
    
    model_payload = {
        "scaler": scaler,
        "models": models,
        "classes": EUROSAT_CLASSES,
        "metrics": eval_metrics,
        "num_samples_trained": len(X_train)
    }
    
    joblib.dump(model_payload, save_path)
    print(f"Successfully saved EuroSAT trained models to {save_path}!")
    return model_payload

if __name__ == "__main__":
    dataset_file = "d:/Terravision/Datasets/archive (1)/eurosat/rgb/2.0.0/eurosat-train.tfrecord-00000-of-00001"
    output_dir = "d:/Terravision/backend/app/models"
    train_and_save_models(dataset_file, output_dir)
