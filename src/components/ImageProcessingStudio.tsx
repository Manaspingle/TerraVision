import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Play, 
  Layers, 
  FileText, 
  Trash2, 
  Sliders, 
  Lock, 
  Clock, 
  Activity, 
  Image as ImageIcon,
  ChevronRight,
  Info,
  Database,
  X,
  CheckCircle2
} from 'lucide-react';
import { PipelineOp, UserProfile } from '../types';
import { processImageApi } from '../api';
import { DIPMatlabVisualizer } from './DIPMatlabVisualizer';

interface StudioProps {
  user: UserProfile | null;
  onOpenSubscription: () => void;
  onOpenReportModal: (ops: PipelineOp[]) => void;
}

const STAGES = [
  { id: 'acquisition', label: '1. Image Acquisition' },
  { id: 'preprocessing', label: '2. Preprocessing' },
  { id: 'noise_removal', label: '3. Noise Removal' },
  { id: 'image_enhancement', label: '4. Enhancement' },
  { id: 'segmentation', label: '5. Segmentation' },
  { id: 'feature_extraction', label: '6. Feature Extraction' },
];

const OPERATIONS_MAP: Record<string, { id: string; label: string; pro?: boolean }[]> = {
  acquisition: [
    { id: 'capture', label: 'Image Capture & Storage' },
    { id: 'sampling', label: 'Down/Upsampling' },
    { id: 'quantization', label: 'Quantization (Bit Depth)' },
    { id: 'digitization', label: 'Digitization Sampling Grid' }
  ],
  preprocessing: [
    { id: 'grayscale', label: 'Grayscale Conversion' },
    { id: 'resizing', label: 'Image Resizing' },
    { id: 'cropping', label: 'Cropping' },
    { id: 'roi_selection', label: 'Region of Interest (ROI)' },
    { id: 'color_conversion', label: 'RGB → HSV / Lab Space' },
    { id: 'normalization', label: 'Image Normalization' },
    { id: 'geometric_correction', label: 'Geometric Rotation' },
    { id: 'image_registration', label: 'Image Registration (ORB)', pro: true }
  ],
  noise_removal: [
    { id: 'mean_filtering', label: 'Mean Filtering' },
    { id: 'median_filtering', label: 'Median Filtering' },
    { id: 'gaussian_filtering', label: 'Gaussian Filtering' },
    { id: 'bilateral_filtering', label: 'Bilateral Filtering' },
    { id: 'wiener_filtering', label: 'Wiener Restoration Filter', pro: true },
    { id: 'min_max_filtering', label: 'Min/Max Filtering' },
    { id: 'low_pass_filter', label: '2D FFT Low-Pass Filter' }
  ],
  image_enhancement: [
    { id: 'contrast_stretching', label: 'Contrast Stretching' },
    { id: 'histogram_equalization', label: 'Histogram Equalization' },
    { id: 'clahe', label: 'CLAHE (Adaptive Equalization)', pro: true },
    { id: 'brightness_adjustment', label: 'Brightness Adjustment' },
    { id: 'gamma_correction', label: 'Gamma Correction' },
    { id: 'image_sharpening', label: 'Image Sharpening' },
    { id: 'high_pass_filter', label: '2D FFT High-Pass Filter' },
    { id: 'unsharp_masking', label: 'Unsharp Masking' }
  ],
  segmentation: [
    { id: 'global_thresholding', label: 'Global Thresholding' },
    { id: 'adaptive_thresholding', label: 'Adaptive Thresholding' },
    { id: 'otsu_thresholding', label: 'Otsu Thresholding' },
    { id: 'edge_segmentation', label: 'Edge-Based Segmentation' },
    { id: 'region_growing', label: 'Region Growing Segmentation' },
    { id: 'watershed_segmentation', label: 'Watershed Segmentation', pro: true },
    { id: 'kmeans', label: 'K-Means Color Segmentation' },
    { id: 'morphological_segmentation', label: 'Morphological Segmentation' }
  ],
  feature_extraction: [
    { id: 'shape_features', label: 'Shape Features (Area/Perimeter)' },
    { id: 'texture_features', label: 'GLCM Texture Matrix (Entropy)', pro: true },
    { id: 'color_features', label: 'Color Histogram & Moments' },
    { id: 'hog', label: 'HOG (Oriented Gradients)', pro: true },
    { id: 'corners', label: 'Harris Corner Detection' }
  ]
};

const SATELLITE_LIBRARY = [
  {
    id: 'sat-1',
    title: 'LANDSAT-8 OLI - Amazon River & Vegetation Band',
    agency: 'NASA / USGS',
    sensor: 'Landsat-8 OLI Band 5 (NIR)',
    resolution: '30m / Pixel',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    desc: 'Multispectral Near-Infrared imagery capturing vegetation index & river tributaries.'
  },
  {
    id: 'sat-2',
    title: 'Sentinel-2 MSI - Coastal Bay & Urban Grid',
    agency: 'ESA (European Space Agency)',
    sensor: 'Sentinel-2 MSI High-Res',
    resolution: '10m / Pixel',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1000&auto=format&fit=crop',
    desc: 'High-resolution multispectral raster suitable for land cover & urban grid segmentation.'
  },
  {
    id: 'sat-3',
    title: 'MODIS Terra - Global Ocean Thermal Current',
    agency: 'NASA EOS',
    sensor: 'MODIS Thermal IR (11 µm)',
    resolution: '250m / Pixel',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1000&auto=format&fit=crop',
    desc: 'Global Earth thermal surface monitoring and sea surface temperature gradient.'
  },
  {
    id: 'sat-4',
    title: 'PlanetScope Dove - Deforestation Rainforest Canopy',
    agency: 'Planet Labs',
    sensor: 'PlanetScope Commercial RGB',
    resolution: '3m / Pixel',
    url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1000&auto=format&fit=crop',
    desc: 'Ultra high-resolution commercial satellite image for canopy analysis & deforestation.'
  },
  {
    id: 'sat-5',
    title: 'Sentinel-1 SAR - C-Band Radar Surface Texture',
    agency: 'ESA Sentinel Constellation',
    sensor: 'C-Band Synthetic Aperture Radar',
    resolution: '20m / Pixel',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop',
    desc: 'All-weather radar backscatter image capturing ocean surface roughness & polar ice.'
  },
  {
    id: 'sat-6',
    title: 'James Webb JWST - Infrared Deep Cosmic Dust Nebula',
    agency: 'NASA / ESA / CSA',
    sensor: 'JWST NIRCam Deep Space',
    resolution: 'Deep Space Near-IR',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1000&auto=format&fit=crop',
    desc: 'Infrared cosmic dust nebula imagery ideal for feature extraction & sharpening.'
  }
];

export const ImageProcessingStudio: React.FC<StudioProps> = ({
  user,
  onOpenSubscription,
  onOpenReportModal
}) => {
  const [selectedStage, setSelectedStage] = useState('preprocessing');
  const [selectedOp, setSelectedOp] = useState('grayscale');
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(SATELLITE_LIBRARY[0].url);
  const [currentImageBlob, setCurrentImageBlob] = useState<Blob | null>(null);
  const [activePresetInfo, setActivePresetInfo] = useState<string>(SATELLITE_LIBRARY[0].title);
  
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [pipelineQueue, setPipelineQueue] = useState<PipelineOp[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [factor, setFactor] = useState(0.5);
  const [ksize, setKsize] = useState(5);
  const [gamma, setGamma] = useState(1.5);
  const [threshold, setThreshold] = useState(127);
  const [kClusters, setKClusters] = useState(4);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentImageBlob(file);
      setActivePresetInfo(`Custom Uploaded Raster: ${file.name}`);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof SATELLITE_LIBRARY[0]) => {
    setCurrentImageSrc(preset.url);
    setCurrentImageBlob(null);
    setActivePresetInfo(preset.title);
    setLibraryModalOpen(false);
  };

  const getBlobFromSrc = async (src: string): Promise<Blob> => {
    if (currentImageBlob) return currentImageBlob;
    const res = await fetch(src);
    return res.blob();
  };

  const handleRunOperation = async () => {
    setErrorMsg(null);
    const opConfig = OPERATIONS_MAP[selectedStage].find((o) => o.id === selectedOp);
    
    if (opConfig?.pro && !user?.isPro) {
      onOpenSubscription();
      return;
    }

    setIsProcessing(true);
    try {
      const blob = await getBlobFromSrc(currentImageSrc);
      const params: Record<string, any> = {
        factor,
        ksize,
        gamma,
        threshold,
        k: kClusters,
        scale: factor,
        angle: 45
      };

      const result = await processImageApi(blob, selectedStage, selectedOp, params);
      
      const newOpItem: PipelineOp = {
        id: `op-${Date.now()}`,
        stage: STAGES.find(s => s.id === selectedStage)?.label || selectedStage,
        operation: opConfig?.label || selectedOp,
        label: opConfig?.label || selectedOp,
        inputImage: currentImageSrc,
        outputImage: result.output_image,
        params,
        metrics: result.metrics || {},
        matlab_analytics: result.matlab_analytics || {},
        timestamp: new Date().toLocaleTimeString()
      };

      setPipelineQueue((prev) => [newOpItem, ...prev]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing operation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Studio Header & Toolbar Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-1">
            <Activity className="w-4 h-4 animate-pulse" /> Studio Workspace
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Satellite DIP Studio</h1>
          <p className="text-xs text-slate-400">
            Queue and execute real 6-stage image transformations with MATLAB-grade graphs & matrix derivations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Preset Satellite Library Trigger */}
          <button
            onClick={() => setLibraryModalOpen(true)}
            className="flex-1 sm:flex-initial glow-btn-outline text-xs flex items-center justify-center gap-2 py-2.5 px-4 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/50"
          >
            <Database className="w-4 h-4 text-cyan-400" /> Satellite Preset Library
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 py-2.5 px-4"
          >
            <Upload className="w-4 h-4" /> Upload Custom TIFF/PNG
          </button>

          {pipelineQueue.length > 0 && (
            <button
              onClick={() => onOpenReportModal(pipelineQueue)}
              className="flex-1 sm:flex-initial glow-btn text-xs flex items-center justify-center gap-2 py-2.5 px-4"
            >
              <FileText className="w-4 h-4" /> Generate PDF ({pipelineQueue.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Controls Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pipeline Stage Picker */}
          <div className="glass-panel p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Select DIP Pipeline Stage
            </h3>

            <div className="space-y-1.5 max-h-56 lg:max-h-none overflow-y-auto pr-0.5">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStage(s.id);
                    setSelectedOp(OPERATIONS_MAP[s.id][0].id);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedStage === s.id
                      ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-md'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{s.label}</span>
                  <ChevronRight className={`w-4 h-4 ${selectedStage === s.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Operation Selector & Parameters */}
          <div className="glass-panel p-4 sm:p-5 space-y-4 sm:space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Select Operation & Parameters
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">Available Operations</label>
              <select
                value={selectedOp}
                onChange={(e) => setSelectedOp(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {OPERATIONS_MAP[selectedStage].map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.label} {op.pro ? '(PRO PLAN REQUIRED)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Parameter Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {selectedOp.includes('filtering') && (
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Kernel Size</span>
                    <span className="font-mono text-cyan-400">{ksize}x{ksize}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={15}
                    step={2}
                    value={ksize}
                    onChange={(e) => setKsize(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              )}

              {selectedOp === 'gamma_correction' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Gamma Value</span>
                    <span className="font-mono text-cyan-400">{gamma}</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={gamma}
                    onChange={(e) => setGamma(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              )}

              {selectedOp.includes('threshold') && (
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Cutoff Threshold</span>
                    <span className="font-mono text-cyan-400">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              )}

              {selectedOp === 'kmeans' && (
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Cluster Count (K)</span>
                    <span className="font-mono text-cyan-400">{kClusters}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={kClusters}
                    onChange={(e) => setKClusters(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* Run Button */}
            {OPERATIONS_MAP[selectedStage].find((o) => o.id === selectedOp)?.pro && !user?.isPro ? (
              <button
                onClick={onOpenSubscription}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
              >
                <Lock className="w-4 h-4" /> Unlock with Pro Plan
              </button>
            ) : (
              <button
                onClick={handleRunOperation}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                {isProcessing ? 'Processing Algorithm...' : 'Run Operation'}
              </button>
            )}
          </div>
        </div>

        {/* Studio Workspace & Queue Display (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Input Image View */}
          <div className="glass-panel p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" /> Active Target Image
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800 font-semibold truncate max-w-[250px]">
                  {activePresetInfo}
                </span>
                <button
                  onClick={() => setLibraryModalOpen(true)}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[200px]">
              <img
                src={currentImageSrc}
                alt="Target Satellite Raster"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Results Queue Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Processed Operations Queue ({pipelineQueue.length})
              </h3>
              {pipelineQueue.length > 0 && (
                <button
                  onClick={() => setPipelineQueue([])}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Queue
                </button>
              )}
            </div>

            {pipelineQueue.length === 0 ? (
              <div className="glass-panel p-8 sm:p-12 text-center text-slate-500 text-xs space-y-2">
                <Info className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No operations executed yet. Select an algorithm and click "Run Operation" to transform the active satellite image.</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {pipelineQueue.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-4 sm:p-6 border-slate-800 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 mr-2">
                          {item.stage}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">{item.label}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> Time: {item.timestamp}
                      </div>
                    </div>

                    {/* Side-by-Side Comparison Grid Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-400">Original Target Image</div>
                        <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 min-h-[140px]">
                          <img src={item.inputImage} alt="Input" className="w-full h-full object-contain" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-cyan-300">Transformed Output Result</div>
                        <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-cyan-900/50 min-h-[140px]">
                          <img src={item.outputImage} alt="Output Result" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>

                    {/* Calculated Metrics Display Table Responsive */}
                    {Object.keys(item.metrics).length > 0 && (
                      <div className="bg-slate-950/80 p-3.5 sm:p-4 rounded-xl border border-slate-800/80">
                        <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                          Quantitative Feature Metrics
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                          {Object.entries(item.metrics).map(([k, v]) => (
                            <div key={k} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                              <div className="text-[10px] text-slate-400 capitalize">{k.replace(/_/g, ' ')}</div>
                              <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5 break-all">
                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MATLAB-GRADE ANALYTICAL GRAPHS, PIXEL MATRICES & FORMULAS */}
                    <DIPMatlabVisualizer op={item} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SATELLITE PRESET LIBRARY MODAL DIALOG */}
      {libraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl glass-panel p-6 sm:p-8 border-slate-800 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setLibraryModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Preset Satellite Image Library</h2>
                <p className="text-xs text-slate-400">Choose from authentic satellite rasters captured by NASA, ESA, and commercial satellites.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {SATELLITE_LIBRARY.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="glass-panel p-4 border-slate-800 hover:border-cyan-500/50 cursor-pointer space-y-3 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur text-[10px] font-mono text-cyan-300 rounded border border-cyan-800">
                        {preset.resolution}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">{preset.agency}</span>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">{preset.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.desc}</p>
                    </div>
                  </div>

                  <button
                    className="w-full py-2 bg-slate-900 group-hover:bg-cyan-600 text-xs font-semibold rounded-xl text-slate-300 group-hover:text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Select Preset Satellite Image
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
