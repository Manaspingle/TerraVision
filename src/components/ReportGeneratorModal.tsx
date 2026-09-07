import React, { useState } from 'react';
import { X, FileText, Printer, Download, CheckCircle2, Calendar, User } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PipelineOp, UserProfile } from '../types';
import { submitReportApi } from '../api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  operationsQueue: PipelineOp[];
}

export const ReportGeneratorModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  user,
  operationsQueue
}) => {
  const [reportTitle, setReportTitle] = useState("Satellite Remote Sensing Processing Report");
  const [selectedOpIds, setSelectedOpIds] = useState<string[]>(
    operationsQueue.map((op) => op.id)
  );
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const toggleOpSelection = (id: string) => {
    if (selectedOpIds.includes(id)) {
      setSelectedOpIds(selectedOpIds.filter((item) => item !== id));
    } else {
      setSelectedOpIds([...selectedOpIds, id]);
    }
  };

  const selectedOps = operationsQueue.filter((op) => selectedOpIds.includes(op.id));

  const handlePrintOrPdf = async () => {
    setIsGenerating(true);
    try {
      // Save report in backend DB
      await submitReportApi({
        title: reportTitle,
        userEmail: user?.email || 'guest@terravision.org',
        userName: user?.displayName || 'User',
        operations: selectedOps,
        notes: notes
      });

      // Capture report element to canvas & export PDF
      const elem = document.getElementById('printable-report');
      if (elem) {
        const canvas = await html2canvas(elem, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel p-8 border-slate-800 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Custom PDF Report Generator</h2>
            <p className="text-xs text-slate-400">Select operations, attach processed images, and print report.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Report Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Operations to Include</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {operationsQueue.map((op) => (
                  <div
                    key={op.id}
                    onClick={() => toggleOpSelection(op.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                      selectedOpIds.includes(op.id)
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{op.label}</div>
                      <div className="text-[10px] opacity-70">Time: {op.timestamp}</div>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${selectedOpIds.includes(op.id) ? 'text-cyan-400' : 'text-slate-700'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Observations / Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add custom analytical observations or spectral conclusions..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handlePrintOrPdf}
              disabled={isGenerating || selectedOps.length === 0}
              className="w-full glow-btn text-xs py-3 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {isGenerating ? 'Rendering PDF...' : 'Download & Print PDF Report'}
            </button>
          </div>

          {/* Report Preview Column (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-200">
            <div id="printable-report" className="p-6 bg-slate-900 rounded-xl space-y-6 text-slate-100">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400">{reportTitle}</h3>
                  <p className="text-[10px] text-slate-400">Generated by Terravision Satellite Platform</p>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div>User: {user?.displayName || 'User'}</div>
                </div>
              </div>

              {notes && (
                <div className="p-3 bg-slate-950 rounded-lg text-xs italic text-slate-300 border border-slate-800">
                  "{notes}"
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Executed Operations Summary</h4>
                {selectedOps.map((op, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-cyan-300">
                      <span>{op.stage} - {op.label}</span>
                      <span className="text-[10px] text-slate-400">Time: {op.timestamp}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">Original</span>
                        <img src={op.inputImage} alt="In" className="w-full h-24 object-contain bg-black rounded" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">Output</span>
                        <img src={op.outputImage} alt="Out" className="w-full h-24 object-contain bg-black rounded" />
                      </div>
                    </div>

                    {Object.keys(op.metrics).length > 0 && (
                      <div className="text-[9px] font-mono text-slate-400 bg-slate-900 p-2 rounded">
                        Metrics: {JSON.stringify(op.metrics)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
