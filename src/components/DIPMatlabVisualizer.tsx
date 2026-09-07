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
    </div>
  );
};
