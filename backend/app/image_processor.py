import cv2
import numpy as np
import io
import base64
from PIL import Image
from scipy import ndimage, signal
from skimage.feature import graycomatrix, graycoprops, hog
from skimage import exposure, color, segmentation, measure

def bytes_to_cv2(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    return img

def cv2_to_base64(img: np.ndarray, format_ext=".png") -> str:
    _, buffer = cv2.imencode(format_ext, img)
    b64 = base64.b64encode(buffer).decode('utf-8')
    mime = "image/png" if format_ext == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64}"

def compute_histogram_data(gray_img: np.ndarray):
    hist = cv2.calcHist([gray_img], [0], None, [256], [0, 256]).flatten()
    # Downsample to 32 bins for rendering crisp visual SVG graphs
    bins32 = [int(np.sum(hist[i*8:(i+1)*8])) for i in range(32)]
    cdf = np.cumsum(hist)
    cdf_normalized = (cdf / cdf.max() * 255).astype(int)
    cdf32 = [int(cdf_normalized[i*8]) for i in range(32)]
    return bins32, cdf32

def process_pipeline_op(img_bytes: bytes, stage: str, op: str, params: dict = None) -> dict:
    if params is None:
        params = {}
    
    img = bytes_to_cv2(img_bytes)
    h, w, c = img.shape
    processed_img = img.copy()
    metrics = {}
    matlab_analytics = {}
    
    gray_orig = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    orig_bins, orig_cdf = compute_histogram_data(gray_orig)
    
    # ---------------------------------------------------------
    # STAGE 1: Image Acquisition
    # ---------------------------------------------------------
    if stage == "acquisition":
        if op in ["capture", "digitization", "image_storage"]:
            metrics = {
                "dimensions": f"{w}x{h} px",
                "total_pixels": int(w * h),
                "channels": c,
                "bit_depth": "8-bit per channel (24-bit color)",
                "memory_size": f"{len(img_bytes) / 1024:.2f} KB"
            }
            grid_img = img.copy()
            step = max(10, min(w, h) // 20)
            for x in range(0, w, step):
                cv2.line(grid_img, (x, 0), (x, h), (0, 255, 0), 1)
            for y in range(0, h, step):
                cv2.line(grid_img, (0, y), (w, y), (0, 255, 0), 1)
            processed_img = grid_img
            
        elif op == "sampling":
            factor = float(params.get("factor", 0.5))
            new_w = max(16, int(w * factor))
            new_h = max(16, int(h * factor))
            downscaled = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
            processed_img = cv2.resize(downscaled, (w, h), interpolation=cv2.INTER_NEAREST)
            metrics = {"original_resolution": f"{w}x{h}", "sampled_resolution": f"{new_w}x{new_h}", "factor": factor}
            
        elif op == "quantization":
            levels = int(params.get("levels", 4))
            step = 256 // levels
            quantized = (gray_orig // step) * step
            processed_img = cv2.cvtColor(quantized, cv2.COLOR_GRAY2BGR)
            metrics = {"quantization_levels": levels, "bits_per_pixel": int(np.log2(levels))}

    # ---------------------------------------------------------
    # STAGE 2: Preprocessing
    # ---------------------------------------------------------
    elif stage == "preprocessing":
        if op == "grayscale":
            processed_img = cv2.cvtColor(gray_orig, cv2.COLOR_GRAY2BGR)
            metrics = {"channels": 1, "mean_intensity": round(float(np.mean(gray_orig)), 2)}
            
        elif op == "color_conversion":
            space = params.get("space", "HSV")
            converted = cv2.cvtColor(img, cv2.COLOR_BGR2HSV if space == "HSV" else cv2.COLOR_BGR2LAB)
            processed_img = converted
            metrics = {"color_space": space}
            
        elif op == "roi_selection":
            center_x, center_y = w // 2, h // 2
            radius = min(w, h) // 3
            mask = np.zeros((h, w), dtype=np.uint8)
            cv2.circle(mask, (center_x, center_y), radius, 255, -1)
            processed_img = cv2.bitwise_and(img, img, mask=mask)
            cv2.circle(processed_img, (center_x, center_y), radius, (0, 255, 0), 2)
            metrics = {"roi_center": f"({center_x}, {center_y})", "radius": radius}
            
        elif op == "image_registration":
            orb = cv2.ORB_create(500)
            kp, _ = orb.detectAndCompute(img, None)
            kp_img = cv2.drawKeypoints(img, kp, None, color=(0, 255, 0))
            processed_img = kp_img
            metrics = {"keypoints_detected": len(kp)}

    # ---------------------------------------------------------
    # STAGE 3: Noise Removal
    # ---------------------------------------------------------
    elif stage == "noise_removal":
        ksize = int(params.get("ksize", 5))
        if ksize % 2 == 0: ksize += 1
        
        if op == "gaussian_filtering":
            processed_img = cv2.GaussianBlur(img, (ksize, ksize), 1.5)
            metrics = {"kernel": f"{ksize}x{ksize}", "sigma": 1.5}
        elif op == "median_filtering":
            processed_img = cv2.medianBlur(img, ksize)
            metrics = {"kernel": f"{ksize}x{ksize}"}
        elif op == "bilateral_filtering":
            processed_img = cv2.bilateralFilter(img, 9, 75, 75)
            metrics = {"diameter": 9, "sigmaColor": 75}
        else:
            processed_img = cv2.blur(img, (ksize, ksize))
            metrics = {"kernel": f"{ksize}x{ksize}"}

    # ---------------------------------------------------------
    # STAGE 4: Image Enhancement & MATLAB Graphs
    # ---------------------------------------------------------
    elif stage == "image_enhancement":
        if op == "contrast_stretching":
            p2, p98 = np.percentile(gray_orig, (2, 98))
            rescaled = exposure.rescale_intensity(gray_orig, in_range=(p2, p98))
            processed_img = cv2.cvtColor(rescaled, cv2.COLOR_GRAY2BGR)
            
            proc_bins, proc_cdf = compute_histogram_data(rescaled)
            metrics = {"p2_percentile": float(p2), "p98_percentile": float(p98), "slope_multiplier": round(float(255 / (p98 - p2 + 1e-5)), 3)}
            
            # MATLAB Analytics Payload for Graphs & Pixel Transfer Table
            matlab_analytics = {
                "type": "contrast_stretching",
                "formula": "s = ((r - r_min) / (r_max - r_min)) * 255",
                "r_min": int(p2),
                "r_max": int(p98),
                "orig_histogram": orig_bins,
                "proc_histogram": proc_bins,
                "cdf_curve": proc_cdf,
                "sample_pixels_before": gray_orig[h//2:h//2+5, w//2:w//2+5].tolist(),
                "sample_pixels_after": rescaled[h//2:h//2+5, w//2:w//2+5].tolist()
            }
            
        elif op == "histogram_equalization":
            eq = cv2.equalizeHist(gray_orig)
            processed_img = cv2.cvtColor(eq, cv2.COLOR_GRAY2BGR)
            proc_bins, proc_cdf = compute_histogram_data(eq)
            metrics = {"std_dev_before": round(float(np.std(gray_orig)), 2), "std_dev_after": round(float(np.std(eq)), 2)}
            
            matlab_analytics = {
                "type": "histogram_equalization",
                "formula": "s_k = T(r_k) = (L - 1) * sum(p_r(r_j))",
                "orig_histogram": orig_bins,
                "proc_histogram": proc_bins,
                "cdf_curve": proc_cdf,
                "sample_pixels_before": gray_orig[h//2:h//2+5, w//2:w//2+5].tolist(),
                "sample_pixels_after": eq[h//2:h//2+5, w//2:w//2+5].tolist()
            }
            
        elif op == "clahe":
            clahe_obj = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            res = clahe_obj.apply(gray_orig)
            processed_img = cv2.cvtColor(res, cv2.COLOR_GRAY2BGR)
            proc_bins, proc_cdf = compute_histogram_data(res)
            metrics = {"clip_limit": 3.0, "tile_grid": "8x8 contextual tiles"}
            
            matlab_analytics = {
                "type": "clahe",
                "formula": "CLAHE Contextual Tile Dynamic Equalization",
                "orig_histogram": orig_bins,
                "proc_histogram": proc_bins,
                "cdf_curve": proc_cdf
            }
            
        elif op == "image_sharpening":
            kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
            sharpened = cv2.filter2D(img, -1, kernel)
            processed_img = sharpened
            metrics = {"kernel": "3x3 Laplacian Sharpening"}
            
            matlab_analytics = {
                "type": "kernel_filter",
                "kernel_matrix": [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
                "explanation": "Laplacian Spatial Convolution Matrix accentuating high-frequency spectral edges."
            }

    # ---------------------------------------------------------
    # STAGE 5: Segmentation & Otsu Variance Graph
    # ---------------------------------------------------------
    elif stage == "segmentation":
        if op == "otsu_thresholding":
            val, thresh = cv2.threshold(gray_orig, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            processed_img = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
            metrics = {"optimal_otsu_threshold_t": float(val)}
            
            # Compute Otsu between-class variance curve for MATLAB plot
            hist = cv2.calcHist([gray_orig], [0], None, [256], [0, 256]).flatten()
            total_pixels = gray_orig.size
            current_max, threshold_t = 0, 0
            sum_total = np.sum(np.arange(256) * hist)
            sum_b, weight_b = 0, 0
            variance_curve = []
            
            for t in range(0, 256, 8):
                weight_b += np.sum(hist[t:t+8])
                if weight_b == 0: continue
                weight_f = total_pixels - weight_b
                if weight_f == 0: break
                sum_b += np.sum(np.arange(t, t+8) * hist[t:t+8])
                mean_b = sum_b / weight_b
                mean_f = (sum_total - sum_b) / weight_f
                var_between = weight_b * weight_f * ((mean_b - mean_f) ** 2)
                variance_curve.append(int(var_between / 1e6))
                
            matlab_analytics = {
                "type": "otsu",
                "optimal_threshold": float(val),
                "variance_curve": variance_curve,
                "formula": "sigma_B^2(t) = w_0(t) * w_1(t) * (mu_0(t) - mu_1(t))^2"
            }
            
        elif op == "watershed_segmentation":
            ret, thresh = cv2.threshold(gray_orig, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            kernel = np.ones((3, 3), np.uint8)
            opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
            sure_bg = cv2.dilate(opening, kernel, iterations=3)
            dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
            ret, sure_fg = cv2.threshold(dist_transform, 0.5 * dist_transform.max(), 255, 0)
            sure_fg = np.uint8(sure_fg)
            unknown = cv2.subtract(sure_bg, sure_fg)
            ret, markers = cv2.connectedComponents(sure_fg)
            markers = markers + 1
            markers[unknown == 255] = 0
            img_ws = img.copy()
            cv2.watershed(img_ws, markers)
            img_ws[markers == -1] = [0, 0, 255]
            processed_img = img_ws
            metrics = {"watershed_basins": int(ret)}
            
        elif op == "kmeans":
            K = int(params.get("k", 4))
            pixel_vals = img.reshape((-1, 3))
            pixel_vals = np.float32(pixel_vals)
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
            _, labels, centers = cv2.kmeans(pixel_vals, K, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
            centers = np.uint8(centers)
            segmented_data = centers[labels.flatten()]
            processed_img = segmented_data.reshape((img.shape))
            metrics = {"k_clusters": K}
            
            matlab_analytics = {
                "type": "kmeans",
                "k_centers": centers.tolist()
            }
        else:
            _, thresh = cv2.threshold(gray_orig, 127, 255, cv2.THRESH_BINARY)
            processed_img = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
            metrics = {"threshold": 127}

    # ---------------------------------------------------------
    # STAGE 6: Feature Extraction MATLAB Matrices & HOG Polar Graphs
    # ---------------------------------------------------------
    elif stage == "feature_extraction":
        if op == "texture_features":
            gray_small = cv2.resize(gray_orig, (128, 128))
            glcm = graycomatrix(gray_small, distances=[1], angles=[0], levels=256, symmetric=True, normed=True)
            contrast = float(graycoprops(glcm, 'contrast')[0, 0])
            correlation = float(graycoprops(glcm, 'correlation')[0, 0])
            energy = float(graycoprops(glcm, 'energy')[0, 0])
            homogeneity = float(graycoprops(glcm, 'homogeneity')[0, 0])
            glcm_pos = glcm[glcm > 0]
            entropy = float(-np.sum(glcm_pos * np.log2(glcm_pos)))
            
            tex_img = img.copy()
            cv2.putText(tex_img, "GLCM Texture Analyzed", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            processed_img = tex_img
            metrics = {
                "glcm_contrast": round(contrast, 4),
                "glcm_correlation": round(correlation, 4),
                "glcm_energy": round(energy, 4),
                "glcm_homogeneity": round(homogeneity, 4),
                "glcm_entropy": round(entropy, 4)
            }
            
            # MATLAB 4x4 Co-Occurrence Matrix Heatmap Slice
            matlab_analytics = {
                "type": "glcm",
                "matrix_slice": glcm[:4, :4, 0, 0].tolist(),
                "metrics": metrics
            }
            
        elif op == "hog":
            resized_gray = cv2.resize(gray_orig, (128, 128))
            fd, hog_image = hog(resized_gray, orientations=8, pixels_per_cell=(16, 16),
                               cells_per_block=(1, 1), visualize=True)
            hog_image_rescaled = exposure.rescale_intensity(hog_image, in_range=(0, 10))
            hog_uint8 = (hog_image_rescaled * 255).astype(np.uint8)
            processed_img = cv2.cvtColor(cv2.resize(hog_uint8, (w, h)), cv2.COLOR_GRAY2BGR)
            metrics = {"orientations": 8, "cell_size": "16x16"}
            
            # MATLAB HOG Gradient Angle Histogram Bins
            hog_bins = [int(x) for x in np.histogram(fd, bins=8)[0]]
            matlab_analytics = {
                "type": "hog",
                "orientation_bins": hog_bins,
                "orientations": 8
            }
            
        elif op == "shape_features":
            _, thresh = cv2.threshold(gray_orig, 127, 255, cv2.THRESH_BINARY)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            feat_img = img.copy()
            cv2.drawContours(feat_img, contours, -1, (0, 255, 0), 2)
            processed_img = feat_img
            
            if contours:
                c_largest = max(contours, key=cv2.contourArea)
                area = float(cv2.contourArea(c_largest))
                perimeter = float(cv2.arcLength(c_largest, True))
                circularity = float(4 * np.pi * area / (perimeter ** 2)) if perimeter > 0 else 0
                metrics = {"area_px": round(area, 2), "perimeter_px": round(perimeter, 2), "circularity": round(circularity, 4)}
            else:
                metrics = {"contours_count": 0}
        else:
            edges = cv2.Canny(gray_orig, 100, 200)
            processed_img = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
            metrics = {"edge_pixels": int(np.count_nonzero(edges))}

    out_b64 = cv2_to_base64(processed_img)
    return {
        "stage": stage,
        "operation": op,
        "output_image": out_b64,
        "metrics": metrics,
        "matlab_analytics": matlab_analytics,
        "success": True
    }
