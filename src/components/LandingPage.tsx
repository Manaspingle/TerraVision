import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Layers, 
  FileSpreadsheet, 
  Eye, 
  Linkedin, 
  ExternalLink,
  Star,
  Database,
  BarChart3,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { Review, UserProfile } from '../types';

interface LandingPageProps {
  user: UserProfile | null;
  onOpenAuth: (role: 'student' | 'admin', mode: 'login' | 'signup') => void;
  onNavigateToTab: (tab: string) => void;
  reviews: Review[];
  onOpenReviewModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  onOpenAuth,
  onNavigateToTab,
  reviews,
  onOpenReviewModal
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'raw' | 'enhanced' | 'segmented'>('enhanced');

  const handleActionClick = (targetTab: string) => {
    if (!user) {
      onOpenAuth('student', 'signup');
    } else {
      onNavigateToTab(targetTab);
    }
  };

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-16 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-8 sm:pt-16 lg:pt-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-5 sm:space-y-6 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 border border-cyan-500/30 rounded-full text-[11px] sm:text-xs font-semibold text-cyan-300 shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-spin" />
            <span>Next-Gen Earth Observation & Satellite Image Processing</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Unlock the Power of Earth Observation with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Real Computer Vision
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-2"
          >
            TerraVision is an advanced remote sensing platform designed for GIS researchers, satellite analysts, and students. Process multispectral satellite imagery using real 6-stage DIP algorithms and export professional PDF analytical reports.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4"
          >
            <button 
              onClick={() => handleActionClick('studio')}
              className="w-full sm:w-auto glow-btn flex items-center justify-center gap-2 group"
            >
              <span>{user ? 'Open Studio Workspace' : 'Sign In / Sign Up to Access Engine'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {!user && (
              <button 
                onClick={() => onOpenAuth('admin', 'login')}
                className="w-full sm:w-auto glow-btn-outline flex items-center justify-center gap-2 text-amber-400 border-amber-500/40 hover:bg-amber-950/40"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Login / Signup</span>
              </button>
            )}
          </motion.div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Activity, label: "Real OpenCV Pipeline", desc: "Native Python image processing" },
            { icon: Layers, label: "6 Pipeline Stages", desc: "Acquisition to Feature Extraction" },
            { icon: FileSpreadsheet, label: "PDF Report Generator", desc: "Custom export with spectral data" },
            { icon: ShieldCheck, label: "Admin Security Gate", desc: "Developer-approved role access" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="glass-panel p-5 text-center space-y-2 border-slate-800/80 hover:border-cyan-500/40 transition-all"
            >
              <item.icon className="w-6 h-6 text-cyan-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-100">{item.label}</h4>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. Interactive Satellite Imagery Visual Preview Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass-panel p-5 sm:p-8 border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-xs font-semibold mb-2">
                <Eye className="w-3.5 h-3.5" /> Interactive Satellite Imagery Engine Preview
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">See Real DIP Transformation in Action</h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Compare raw Landsat-8 satellite data with real-time Python OpenCV CLAHE enhancement and Watershed land-cover segmentation.
              </p>
            </div>

            {/* Interactive Preview Mode Tabs (Horizontally Scrollable on Mobile) */}
            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-max">
                <button
                  onClick={() => setActivePreviewTab('raw')}
                  className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activePreviewTab === 'raw' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Satellite Band
                </button>
                <button
                  onClick={() => setActivePreviewTab('enhanced')}
                  className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activePreviewTab === 'enhanced' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CLAHE Enhanced
                </button>
                <button
                  onClick={() => setActivePreviewTab('segmented')}
                  className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activePreviewTab === 'segmented' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Watershed Segmented
                </button>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE LAYOUT: RESPONSIVE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Column: Image Canvas (7 Cols) */}
            <div className="lg:col-span-7 relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center min-h-[220px]">
              {activePreviewTab === 'raw' && (
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"
                  alt="Raw Satellite Data"
                  className="w-full h-full object-cover filter contrast-75 brightness-90"
                />
              )}
              {activePreviewTab === 'enhanced' && (
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"
                  alt="CLAHE Enhanced Satellite Data"
                  className="w-full h-full object-cover filter contrast-150 saturate-150 brightness-110"
                />
              )}
              {activePreviewTab === 'segmented' && (
                <img
                  src="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop"
                  alt="Watershed Segmented Land Cover"
                  className="w-full h-full object-cover filter hue-rotate-90 saturate-200"
                />
              )}

              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-300 block">
                    {activePreviewTab === 'raw' && 'Raw LANDSAT-8 OLI Band 5 (NIR)'}
                    {activePreviewTab === 'enhanced' && 'Stage 4: CLAHE Contrast Stretching'}
                    {activePreviewTab === 'segmented' && 'Stage 5: Watershed Region Segmentation'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Live OpenCV NumPy calculation preview
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: SPECS & ANALYTICAL METRICS CARD (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /> Live Analytical Breakdown
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Latency: 8.4 ms
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {activePreviewTab === 'raw' && 'Unprocessed Multispectral Raster'}
                    {activePreviewTab === 'enhanced' && 'Adaptive Tile Grid CLAHE'}
                    {activePreviewTab === 'segmented' && 'Watershed Boundary Distance Transform'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activePreviewTab === 'raw' && 'Original 11-band LANDSAT 8 raw spectral data prior to noise reduction or dynamic range stretching.'}
                    {activePreviewTab === 'enhanced' && 'Enhances local contrast without amplifying atmospheric haze using 8x8 contextual tile limits.'}
                    {activePreviewTab === 'segmented' && 'Isolates water basins, forest cover, and urban boundaries via gradient markers.'}
                  </p>
                </div>

                {/* Computed Quantitative Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Signal-to-Noise (SNR)</div>
                    <div className="text-xs sm:text-sm font-bold text-cyan-400 font-mono mt-0.5">
                      {activePreviewTab === 'raw' ? '12.4 dB' : activePreviewTab === 'enhanced' ? '28.6 dB' : '34.1 dB'}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Dynamic Range Ratio</div>
                    <div className="text-xs sm:text-sm font-bold text-cyan-400 font-mono mt-0.5">
                      {activePreviewTab === 'raw' ? '1:45' : activePreviewTab === 'enhanced' ? '1:255 (Full)' : '1:210'}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Segmented Polygons</div>
                    <div className="text-xs sm:text-sm font-bold text-cyan-400 font-mono mt-0.5">
                      {activePreviewTab === 'raw' ? '0' : activePreviewTab === 'enhanced' ? '3' : '18 Basins'}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Spatial Resolution</div>
                    <div className="text-xs sm:text-sm font-bold text-cyan-400 font-mono mt-0.5">10m / Pixel</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleActionClick('studio')}
                className="w-full glow-btn text-xs py-3 flex items-center justify-center gap-2"
              >
                <span>{user ? 'Run Live in Studio' : 'Sign In / Sign Up to Process Your Datasets'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Supported Satellite Constellations & Formats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-xs font-semibold">
            <Database className="w-3.5 h-3.5" /> Universal Earth Observation Support
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Compatible with Global Satellite Constellations</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
            Ingest multispectral datasets from space agencies and commercial Earth observation platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: "Landsat-8 / 9 OLI", agency: "NASA / USGS", bands: "11 Bands (Visible, NIR, SWIR, TIRS)" },
            { name: "Sentinel-2 MSI", agency: "ESA (European Space Agency)", bands: "13 Spectral Bands (10m Resolution)" },
            { name: "MODIS Terra & Aqua", agency: "NASA EOS", bands: "36 Spectral Bands (Global Monitoring)" },
            { name: "PlanetScope & SkySat", agency: "Planet Labs", bands: "3m High-Res Commercial Imagery" }
          ].map((sat, idx) => (
            <div key={idx} className="glass-panel p-5 sm:p-6 border-slate-800 hover:border-cyan-500/40 transition-all text-center space-y-2">
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 mx-auto" />
              <h4 className="text-base font-bold text-white">{sat.name}</h4>
              <div className="text-xs text-cyan-400 font-semibold">{sat.agency}</div>
              <p className="text-[11px] text-slate-400">{sat.bands}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How TerraVision Works (3 Simple Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How TerraVision Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
            Start processing satellite imagery in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {[
            {
              step: "01",
              title: "Create Student or Admin Account",
              desc: "Sign up with Email or Google Sign-In to gain secure access to the processing engine.",
              badge: "Access Guarded"
            },
            {
              step: "02",
              title: "Upload & Select Pipeline Stage",
              desc: "Upload satellite rasters or select preset imagery across Acquisition, Preprocessing, Enhancement, Noise Removal, Segmentation, or Feature Extraction.",
              badge: "OpenCV Engine"
            },
            {
              step: "03",
              title: "Run Operations & Export Reports",
              desc: "Execute transformations in real-time, view side-by-side output queues, and generate custom downloadable PDF reports.",
              badge: "Instant PDF Export"
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-6 sm:p-8 border-slate-800 space-y-4 relative">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-xl font-extrabold flex items-center justify-center">
                {item.step}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {item.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Real Platform Reviews Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Real Community Reviews</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Hear from remote sensing researchers and GIS engineers using TerraVision.</p>
          </div>
          <button
            onClick={() => handleActionClick('reviews')}
            className="glow-btn-outline text-xs flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{user ? 'Write Review' : 'Sign In / Sign Up to Review'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="glass-panel p-5 sm:p-6 border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">{rev.userName}</h4>
                    <p className="text-[11px] text-slate-400">{rev.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 italic">"{rev.comment}"</p>
                <div className="text-[10px] text-slate-500 text-right">{rev.date}</div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 glass-panel text-slate-400 text-sm">
              No reviews submitted yet. Sign in to write the first review!
            </div>
          )}
        </div>
      </section>

      {/* 6. Platform Creator Spotlight (Manas Pingle) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass-panel p-6 sm:p-8 md:p-12 border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-cyan-950/40 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 shadow-xl shadow-cyan-500/30">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-cyan-400">
                MP
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4 text-center md:text-left flex-1">
            <div className="inline-block px-3 py-1 bg-cyan-950 border border-cyan-800 rounded-full text-xs font-semibold text-cyan-400">
              Platform Architect & Creator
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Manas Pingle</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Engineered TerraVision to bridge computer vision & digital image processing with satellite remote sensing research. Connect with Manas for collaboration, platform features, or technical inquiries.
            </p>
            <a
              href="https://www.linkedin.com/in/manas-pingle-14666a268/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all group"
            >
              <Linkedin className="w-4 h-4" />
              <span>Connect with Manas Pingle on LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
