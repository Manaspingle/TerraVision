import unittest
import numpy as np
import cv2
from app.image_processor import process_pipeline_op, cv2_to_base64

class TestDIPPipeline(unittest.TestCase):

    def setUp(self):
        # Create synthetic test image (200x200 3-channel RGB)
        self.img = np.zeros((200, 200, 3), dtype=np.uint8)
        cv2.rectangle(self.img, (50, 50), (150, 150), (0, 255, 0), -1)
        cv2.circle(self.img, (100, 100), 30, (255, 0, 0), -1)
        _, buffer = cv2.imencode('.png', self.img)
        self.img_bytes = buffer.tobytes()

    def test_stage1_acquisition(self):
        res = process_pipeline_op(self.img_bytes, "acquisition", "quantization", {"levels": 4})
        self.assertTrue(res["success"])
        self.assertIn("data:image/png;base64,", res["output_image"])

    def test_stage2_preprocessing(self):
        res = process_pipeline_op(self.img_bytes, "preprocessing", "grayscale", {})
        self.assertTrue(res["success"])
        self.assertEqual(res["metrics"]["channels"], 1)

    def test_stage3_noise_removal(self):
        res = process_pipeline_op(self.img_bytes, "noise_removal", "gaussian_filtering", {"ksize": 5})
        self.assertTrue(res["success"])

    def test_stage4_enhancement(self):
        res = process_pipeline_op(self.img_bytes, "image_enhancement", "clahe", {"clip_limit": 2.0})
        self.assertTrue(res["success"])

    def test_stage5_segmentation(self):
        res = process_pipeline_op(self.img_bytes, "segmentation", "otsu_thresholding", {})
        self.assertTrue(res["success"])
        self.assertIn("optimal_otsu_threshold", res["metrics"])

    def test_stage6_feature_extraction(self):
        res = process_pipeline_op(self.img_bytes, "feature_extraction", "shape_features", {})
        self.assertTrue(res["success"])
        self.assertIn("area_px", res["metrics"])

if __name__ == '__main__':
    unittest.main()
