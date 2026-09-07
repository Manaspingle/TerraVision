import React from 'react';
import { Linkedin, Sparkles, ExternalLink, ShieldCheck, KeyRound } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onOpenMasterAdminAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMasterAdminAuth }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 pt-12 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="mb-4">
            <Logo size="md" />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Advanced Remote Sensing Satellite Earth Observation Engine with 6-stage Digital Image Processing Pipeline & Analysis.
          </p>
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 rounded-lg px-3 py-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Earth Observation Engine v1.0
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Platform Pipeline</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="hover:text-cyan-400 transition-colors">1. Image Acquisition</li>
            <li className="hover:text-cyan-400 transition-colors">2. Preprocessing & Alignment</li>
            <li className="hover:text-cyan-400 transition-colors">3. Multi-Filter Noise Removal</li>
            <li className="hover:text-cyan-400 transition-colors">4. CLAHE & Sharpening</li>
            <li className="hover:text-cyan-400 transition-colors">5. Watershed & Otsu Segmentation</li>
            <li className="hover:text-cyan-400 transition-colors">6. GLCM & HOG Feature Extraction</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="hover:text-cyan-400 transition-colors cursor-pointer">Educational Blogs</li>
            <li className="hover:text-cyan-400 transition-colors cursor-pointer">User Reviews & Ratings</li>
            <li className="hover:text-cyan-400 transition-colors cursor-pointer">PDF Custom Reports</li>
            <li className="hover:text-cyan-400 transition-colors cursor-pointer">Pro Subscription Plans</li>
          </ul>
        </div>

        {/* CREATOR & MASTER ADMIN DEVELOPER GATEWAY SECTION */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-cyan-400 mb-1">Platform Creator</h4>
            <p className="text-lg font-bold text-slate-100 mb-0.5">Manas Pingle</p>
            <p className="text-xs text-slate-400">Lead Developer & Geospatial Systems Architect</p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <a
              href="https://www.linkedin.com/in/manas-pingle-14666a268/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold rounded-xl transition-all duration-300 w-full justify-center group"
            >
              <Linkedin className="w-4 h-4 text-blue-400 group-hover:text-white" />
              Connect on LinkedIn
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* MASTER ADMIN DEVELOPER LOGIN BUTTON IN FOOTER AS REQUESTED */}
            {onOpenMasterAdminAuth && (
              <button
                onClick={onOpenMasterAdminAuth}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-purple-300 text-xs font-bold rounded-xl transition-all w-full"
              >
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>Master Developer Gateway</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} TerraVision. Built for High-Performance Geospatial Analytics.</p>
        <p className="text-slate-400 font-medium">Creator: <span className="text-cyan-400">Manas Pingle</span></p>
      </div>
    </footer>
  );
};
