import React from 'react';
import { BarChart2, TrendingUp, Grid, Cpu, Activity, Sigma } from 'lucide-react';
import { PipelineOp } from '../types';

interface MatlabProps {
  op: PipelineOp;
}

export const DIPMatlabVisualizer: React.FC<MatlabProps> = ({ op }) => {
  const analytics = op.matlab_analytics || {};
  const stage = op.stage?.toLowerCase() || '';
  const operation = op.operation?.toLowerCase() || '';

  // Generate synthetic 32-bin histogram data if server is in client fallback
  const origHist = analytics.orig_histogram || Array.from({ length: 32 }, (_, i) => Math.floor(Math.sin(i / 5) * 80 + 100));
  const procHist = analytics.proc_histogram || Array.from({ length: 32 }, (_, i) => Math.floor(Math.cos(i / 5) * 70 + 110));
  const cdfCurve = analytics.cdf_curve || Array.from({ length: 32 }, (_, i) => Math.floor((i / 32) * 255));
  const maxBinVal = Math.max(...origHist, ...procHist, 1);

  const samplePixelsBefore = analytics.sample_pixels_before || [
    [42, 45, 50, 52, 48],
    [44, 49, 53, 58, 51],
    [50, 55, 60, 62, 57],
    [48, 52, 58, 65, 60],
    [45, 50, 54, 61, 58]
  ];

  const samplePixelsAfter = analytics.sample_pixels_after || [
    [10, 22, 45, 58, 38],
    [18, 41, 62, 88, 52],
    [45, 72, 102, 115, 85],
    [35, 58, 88, 130, 100],
    [22, 45, 65, 110, 92]
  ];

  return (
    <div className="mt-4 p-4 bg-slate-950/90 rounded-2xl border border-cyan-900/60 space-y-5">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">MATLAB Analytics Engine</span>
            <span className="text-[10px] text-slate-400 block">Quantitative Signal Graphs, Pixel Matrices & Math Derivations</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          MATLAB R2026b Algorithm Equivalence
        </span>
      </div>

      {/* 1. HISTOGRAM EQUALIZATION / CONTRAST STRETCHING VISUALIZER */}
      {(stage.includes('enhancement') || operation.includes('histogram') || operation.includes('contrast') || operation === 'clahe') && (
        <div className="space-y-4">
          {/* Histogram Bar Chart (imhist equivalent) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> Pixel Intensity Distribution (imhist Bins 0..255)
              </span>
              <span className="text-[10px] text-slate-400">Blue: Original | Cyan: Processed</span>
            </div>

            <div className="h-32 bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-end justify-between gap-1 relative">
              {/* CDF Cumulative Distribution Curve Line Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none p-3" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={`M 0 ${100 - (cdfCurve[0] / 255) * 100} ` + cdfCurve.map((val: number, idx: number) => `L ${(idx / 31) * 100} ${100 - (val / 255) * 100}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
              </svg>

              {origHist.map((val: number, idx: number) => {
                const origH = Math.max(4, (val / maxBinVal) * 100);
                const procH = Math.max(4, ((procHist[idx] || val) / maxBinVal) * 100);
                return (
                  <div key={idx} className="flex-1 flex items-end gap-0.5 h-full relative group" title={`Bin ${idx * 8}: Orig ${val}, Processed ${procHist[idx] || val}`}>
                    <div className="w-1/2 bg-blue-600/70 rounded-t group-hover:bg-blue-400 transition-colors" style={{ height: `${origH}%` }} />
                    <div className="w-1/2 bg-cyan-400 rounded-t group-hover:bg-cyan-300 transition-colors" style={{ height: `${procH}%` }} />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
              <span>Intensity 0 (Dark)</span>
              <span>128 (Midtone)</span>
              <span>255 (Highlights)</span>
            </div>
          </div>

          {/* Pixel Matrix Table & Math Formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-cyan-400" /> 5x5 Input Pixel Intensity Matrix (r_k)
              </div>
              <div className="grid grid-cols-5 gap-1 font-mono text-[10px] text-center">
                {samplePixelsBefore.map((row: number[], rIdx: number) =>
                  row.map((val: number, cIdx: number) => (
                    <div key={`${rIdx}-${cIdx}`} className="p-1.5 bg-slate-950 rounded text-slate-300 border border-slate-850">
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> 5x5 Equalized Output Matrix (s_k)
              </div>
              <div className="grid grid-cols-5 gap-1 font-mono text-[10px] text-center">
                {samplePixelsAfter.map((row: number[], rIdx: number) =>
                  row.map((val: number, cIdx: number) => (
                    <div key={`${rIdx}-${cIdx}`} className="p-1.5 bg-cyan-950 rounded text-cyan-300 border border-cyan-800 font-bold">
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mathematical Formula Card */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">MATLAB Imadjust Mathematical Derivation</div>
            <div className="text-cyan-300 font-bold">
              {analytics.formula || "s_k = T(r_k) = (L - 1) * sum(p_r(r_j))"}
            </div>
            {analytics.r_min !== undefined && (
              <div className="text-[10px] text-slate-400">
                Percentile Bounds: r_min = {analytics.r_min}, r_max = {analytics.r_max}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. OTSU THRESHOLDING BETWEEN-CLASS VARIANCE GRAPH */}
      {operation.includes('otsu') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Otsu Between-Class Variance Curve σ_B²(t)
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Optimal Threshold t* = {analytics.optimal_threshold || 128}
            </span>
          </div>

          <div className="h-28 bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-end justify-between gap-1 relative">
            <svg className="absolute inset-0 w-full h-full p-3 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 0 90 Q 30 70 50 10 Q 70 70 100 90"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
              />
              {/* Optimal Threshold Line Indicator */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3" />
            </svg>
          </div>

          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
            Formula: {analytics.formula || "sigma_B^2(t) = w_0(t) * w_1(t) * (mu_0(t) - mu_1(t))^2"}
          </div>
        </div>
      )}

      {/* 3. CONVOLUTION KERNEL MATRIX (Sharpening / Laplacian / Gaussian) */}
      {(operation.includes('sharpen') || stage.includes('enhancement') && analytics.kernel_matrix) && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" /> 3x3 Spatial Convolution Kernel Matrix h(m,n)
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto font-mono text-center text-xs">
            {(analytics.kernel_matrix || [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]).map((row: number[], rIdx: number) =>
              row.map((val: number, cIdx: number) => (
                <div key={`${rIdx}-${cIdx}`} className="p-3 bg-cyan-950/80 rounded-xl border border-cyan-800 font-bold text-cyan-300 text-sm">
                  {val}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. GLCM 4x4 CO-OCCURRENCE MATRIX & TEXTURE HEATMAP */}
      {operation.includes('texture') && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-cyan-400" /> GLCM 4x4 Co-Occurrence Matrix Heatmap (0° Orientation)
          </div>

          <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-xs max-w-sm mx-auto">
            {(analytics.matrix_slice || [[0.42, 0.12, 0.05, 0.01], [0.12, 0.38, 0.15, 0.03], [0.05, 0.15, 0.29, 0.08], [0.01, 0.03, 0.08, 0.22]]).map((row: number[], rIdx: number) =>
              row.map((val: number, cIdx: number) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="p-2.5 rounded-lg border font-bold text-cyan-300"
                  style={{
                    backgroundColor: `rgba(6, 182, 212, ${Math.min(1, val * 2.5 + 0.1)})`,
                    borderColor: 'rgba(6, 182, 212, 0.4)'
                  }}
                >
                  {typeof val === 'number' ? val.toFixed(2) : val}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. HOG GRADIENT ORIENTATION ANGLE HISTOGRAM */}
      {operation.includes('hog') && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-cyan-400" /> HOG Gradient Orientation Bins (8 Directions)
          </div>

          <div className="h-24 bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-end justify-between gap-2">
            {(analytics.orientation_bins || [45, 82, 120, 95, 60, 40, 75, 110]).map((val: number, idx: number) => {
              const hPct = Math.max(10, (val / 150) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-cyan-500 rounded-t hover:bg-cyan-400 transition-colors" style={{ height: `${hPct}%` }} />
                  <span className="text-[9px] font-mono text-slate-400">{idx * 22.5}°</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. MATLAB STRIDE SAMPLING VISUALIZER */}
      {(operation.includes('sampling') || analytics.type === 'matlab_sampling') && (
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-cyan-900/80">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-cyan-400" /> MATLAB Spatial Stride Subsampling Matrix Derivation
          </div>
          <div className="text-[11px] font-mono text-cyan-200 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-amber-400">% MATLAB 2D Sampling Stride Code</div>
            <div>{analytics.formula || 'sampled_img = gray_img(1:s:end, 1:s:end);'}</div>
            <div className="text-slate-400 pt-1">{analytics.explanation || 'Downsamples 2D image matrix using stride s.'}</div>
          </div>
          {analytics.sample_pixel_submatrix && (
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5">Sample 4x4 Subsampled Pixel Matrix:</span>
              <div className="grid grid-cols-4 gap-1 max-w-xs font-mono text-center text-xs">
                {analytics.sample_pixel_submatrix.map((row: number[], rIdx: number) =>
                  row.map((val: number, cIdx: number) => (
                    <div key={`${rIdx}-${cIdx}`} className="p-2 bg-slate-950 rounded border border-cyan-800 text-cyan-300 font-bold">
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. GRAYSCALE TO RGB CONVERSION VISUALIZER */}
      {(operation.includes('grayscale_to_rgb') || analytics.type === 'grayscale_to_rgb') && (
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-indigo-900/80">
          <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-400" /> MATLAB Grayscale → 24-bit RGB Matrix Derivation
          </div>
          <div className="text-[11px] font-mono text-indigo-200 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-amber-400">% MATLAB RGB Matrix Concatenation / Colormap</div>
            <div>{analytics.formula || 'RGB = cat(3, gray_img, gray_img, gray_img);'}</div>
            <div className="text-slate-400 pt-1">{analytics.explanation || 'Expands 1-channel luminance into 3-channel 24-bit RGB space.'}</div>
          </div>
        </div>
      )}

      {/* 8. MATLAB QUANTIZATION VISUALIZER */}
      {(operation.includes('quantization') || analytics.type === 'matlab_quantization') && (
        <div className="space-y-4 bg-slate-900/90 p-4 rounded-xl border border-purple-900/80">
          <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <Sigma className="w-4 h-4 text-purple-400" /> MATLAB Intensity Quantization Derivation
          </div>

          {/* MATLAB Code Block */}
          <div className="text-[11px] font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-amber-400">% MATLAB Quantization — Uniform Interval Mapping</div>
            <div className="text-purple-200 whitespace-pre-wrap">{analytics.formula || 'img_double = double(img);\nquantized_img = uint8(floor(img_double / 256 * L) * (256/L));'}</div>
            <div className="text-slate-400 pt-1 text-[10px]">{analytics.explanation || 'Maps 256 continuous intensity levels into L uniform quantization intervals.'}</div>
          </div>

          {/* Quantization Level Bars */}
          {analytics.quantization_levels && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quantization Step Intervals — L={analytics.quantization_levels} Levels ({analytics.bits_per_pixel} bits/px)
              </div>
              <div className="h-14 bg-slate-950 rounded-xl border border-slate-800 flex items-end overflow-hidden px-1.5 pt-1.5 gap-px">
                {Array.from({ length: Math.min(analytics.quantization_levels, 32) }, (_, i) => {
                  const L = Math.min(analytics.quantization_levels, 32);
                  const hue = Math.round((i / L) * 270);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{ height: `${55 + Math.sin(i * 1.1) * 22}%`, background: `hsl(${hue},70%,45%)` }}
                      title={`Level ${i}: ${Math.round(i * 256 / analytics.quantization_levels)}–${Math.round((i+1) * 256 / analytics.quantization_levels) - 1}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 px-1">
                <span>0 (Black)</span><span>128 (Mid)</span><span>255 (White)</span>
              </div>
            </div>
          )}

          {/* Before / After 5x5 Pixel Matrices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                <Grid className="w-3 h-3 text-slate-400" /> Input f(x,y)
              </div>
              <div className="grid grid-cols-5 gap-0.5 font-mono text-[9px] text-center">
                {(analytics.sample_pixels_before || [
                  [42,45,50,52,48],[44,49,53,58,51],[50,55,60,62,57],[48,52,58,65,60],[45,50,54,61,58]
                ]).map((row: number[], rIdx: number) =>
                  row.map((val: number, cIdx: number) => (
                    <div key={`b-${rIdx}-${cIdx}`}
                      className="p-1 rounded border border-slate-700 text-slate-300"
                      style={{ backgroundColor: `rgba(100,100,100,${val/320})` }}>
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-purple-900/50 space-y-1.5">
              <div className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                <Sigma className="w-3 h-3 text-purple-400" /> Q(f(x,y))
              </div>
              <div className="grid grid-cols-5 gap-0.5 font-mono text-[9px] text-center">
                {(analytics.sample_pixels_after || [
                  [32,32,48,48,32],[32,48,48,48,48],[48,48,48,48,48],[32,48,48,64,48],[32,48,48,48,48]
                ]).map((row: number[], rIdx: number) =>
                  row.map((val: number, cIdx: number) => (
                    <div key={`a-${rIdx}-${cIdx}`}
                      className="p-1 rounded border border-purple-800 text-purple-200 font-bold bg-purple-950/60">
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MATLAB DIGITIZATION GRID VISUALIZER */}
      {(operation.includes('digitization') || analytics.type === 'matlab_digitization') && (
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-red-900/80">
          <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-red-400" /> MATLAB Spatial Digitization Grid Derivation
          </div>
          <div className="text-[11px] font-mono text-red-200 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-amber-400">% MATLAB Red Grid Line Visualization Code</div>
            <div className="whitespace-pre-wrap">{analytics.formula || "line([x x], [1 rows], 'Color', 'r');"}</div>
            <div className="text-slate-400 pt-1">{analytics.explanation || 'Overlays red spatial sampling grid on continuous image.'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

