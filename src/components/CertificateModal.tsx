import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, CheckCircle, Share2, ShieldCheck, Award, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface CertificateModalProps {
  studentName: string;
  courseTitle: string;
  issueDate?: string;
  certificateId?: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName = 'Mr. Rajababu Mehta',
  courseTitle,
  issueDate = '2083/01/14',
  certificateId: initialCertId,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const certId = initialCertId || `AIC-CERT-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    setIsDownloading(true);
    try {
      const node = document.getElementById('certificate-print-area');
      if (!node) return;
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true, fontEmbedCSS: '' });
      const link = document.createElement('a');
      const sanitizedName = (studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `AI_Clipzone_Certificate_${sanitizedName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      // Fallback to print if html-to-image encounters restricted cross-origin fonts
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const text = `Verified Certificate of Completion - ${studentName} (${courseTitle}) - ID: ${certId} - AI Clipzone Nepal`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-6 overflow-y-auto min-h-screen">
        {/* Printable CSS style injection */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #certificate-print-area, #certificate-print-area * {
              visibility: visible;
            }
            #certificate-print-area {
              position: fixed;
              left: 0;
              top: 0;
              width: 100vw;
              height: 100vh;
              margin: 0;
              padding: 0;
              box-shadow: none;
              border: none;
              border-radius: 0;
              background-color: #060b1e !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: landscape;
              margin: 0;
            }
          }
        `}</style>

        {/* Top Floating Bar Controls */}
        <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 mb-2 sm:mb-4 flex flex-wrap items-center justify-between gap-2.5 text-white shadow-xl z-20 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                Official Course Certificate 📜
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
                  ID: {certId}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Verified Certificate issued by AI Clipzone Nepal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Image Download Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition shadow-lg shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Certificate...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Certificate (Direct PNG)</span>
                </>
              )}
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* Copy Verification Link */}
            <button
              onClick={handleCopyLink}
              className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold px-3 py-2 rounded-xl border border-purple-700/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Details!' : 'Share'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white p-2 rounded-xl transition cursor-pointer"
              title="Close Certificate View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN CERTIFICATE CANVAS BOX (Fits cleanly without force scrolling) */}
        <div className="w-full flex-1 flex items-center justify-center my-auto py-1 sm:py-2">
          <div
            id="certificate-print-area"
            className="relative w-full max-w-[880px] aspect-[1.414/1] bg-[#060b1e] rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 shadow-2xl overflow-hidden border-2 sm:border-4 border-[#c59b27] flex flex-col justify-between text-center select-none font-sans"
            style={{
              backgroundImage: 'radial-gradient(circle at center, #0f1c42 0%, #060b1e 80%)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), inset 0 0 80px rgba(197,155,39,0.15)',
            }}
          >
            {/* Outer Luxury Metallic Border Multi-Layers */}
            <div className="absolute inset-2 sm:inset-3 border-2 border-[#e6c663] rounded-lg pointer-events-none opacity-90" />
            <div className="absolute inset-3 sm:inset-4 border border-[#8a6a18] rounded-md pointer-events-none opacity-80" />

            {/* Corner Ornate Baroque Flourish Decorations (4 Corners) */}
            <svg className="absolute top-3 left-3 w-12 h-12 sm:w-20 sm:h-20 text-[#e6c663] opacity-85 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
              <circle cx="20" cy="20" r="3" />
              <path d="M0,0 L35,0 C20,0 0,20 0,35 Z M0,0 L0,35 C0,20 20,0 35,0 Z" />
            </svg>
            <svg className="absolute top-3 right-3 w-12 h-12 sm:w-20 sm:h-20 text-[#e6c663] opacity-85 pointer-events-none transform rotate-90" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
              <circle cx="20" cy="20" r="3" />
            </svg>
            <svg className="absolute bottom-3 left-3 w-12 h-12 sm:w-20 sm:h-20 text-[#e6c663] opacity-85 pointer-events-none transform -rotate-90" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
              <circle cx="20" cy="20" r="3" />
            </svg>
            <svg className="absolute bottom-3 right-3 w-12 h-12 sm:w-20 sm:h-20 text-[#e6c663] opacity-85 pointer-events-none transform rotate-180" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
              <circle cx="20" cy="20" r="3" />
            </svg>

            {/* Background Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <span className="font-['Cinzel'] text-[160px] font-black text-[#e6c663] tracking-widest uppercase">
                Ai
              </span>
            </div>

            {/* HEADER SECTION: LOGO (TOP LEFT) & MAIN TITLE */}
            <div className="relative z-10 flex items-start justify-between w-full pt-1 sm:pt-2">
              {/* Gold Circular Ai Clipzone Badge (Top Left) */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-[#e6c663] p-1 flex items-center justify-center shadow-lg bg-gradient-to-br from-[#121e42] to-[#080e26]">
                  <div className="w-full h-full rounded-full border border-[#ca8a04]/60 flex flex-col items-center justify-center text-center p-1 bg-[#09112a]">
                    <span className="font-['Playfair_Display'] font-black text-sm sm:text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 leading-none">
                      Ai
                    </span>
                    <span className="text-[7px] sm:text-[9px] md:text-[10px] font-extrabold text-amber-300 tracking-wider uppercase leading-none mt-0.5">
                      Clipzone
                    </span>
                  </div>
                </div>
              </div>

              {/* CENTER TITLE: CERTIFICATE OF ACHIEVEMENT */}
              <div className="flex-1 text-center pr-12 sm:pr-16">
                <h1 className="font-['Cinzel'] text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#fffbeb] via-[#fef08a] to-[#d97706] tracking-[0.15em] uppercase drop-shadow-md">
                  CERTIFICATE
                </h1>
                <h2 className="font-['Cinzel'] text-[10px] sm:text-xs md:text-sm font-black text-amber-300/90 tracking-[0.35em] uppercase mt-1">
                  OF ACHIEVEMENT
                </h2>
              </div>
            </div>

            {/* CERTIFICATION BODY STATEMENT */}
            <div className="relative z-10 my-auto py-2 sm:py-4">
              <p className="font-serif italic text-slate-300 text-xs sm:text-sm md:text-base tracking-wide">
                This is to certify that
              </p>

              {/* STUDENT CALLIGRAPHIC NAME */}
              <div className="my-2 sm:my-3 relative inline-block max-w-full px-4">
                <h2 className="font-['Great_Vibes'] text-3xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#fef08a] to-[#eab308] font-bold tracking-wide drop-shadow-lg leading-tight px-2">
                  {studentName}
                </h2>

                {/* Golden Horizontal Divider Line with Flourish Tips & Center Sparkle */}
                <div className="w-full max-w-md mx-auto flex items-center justify-center gap-2 mt-1">
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#e6c663] to-[#e6c663]" />
                  <span className="text-amber-300 text-xs font-serif">♦ ✦ ♦</span>
                  <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#e6c663] to-[#e6c663]" />
                </div>
              </div>

              {/* ACHIEVEMENT STATEMENT */}
              <p className="font-['Cinzel'] text-[10px] sm:text-xs md:text-sm font-bold text-amber-300 tracking-[0.2em] uppercase mt-2">
                HAS SUCCESSFULLY COMPLETED
              </p>

              {/* COURSE TITLE */}
              <h3 className="font-sans font-black text-sm sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#fef08a] to-[#f59e0b] tracking-wider uppercase my-1.5 sm:my-2 leading-snug max-w-3xl mx-auto px-4">
                {courseTitle || 'AI CONTENT CREATION & DIGITAL DESIGN MASTERCLASS'}
              </h3>

              {/* COURSE DESCRIPTION SUMMARY */}
              <p className="text-slate-300/90 text-[9px] sm:text-xs md:text-sm font-normal max-w-2xl mx-auto leading-relaxed px-4 my-2">
                an advanced training in 30+ AI Tools covering AI Video Creation, AI Image Generation, AI Music & Song Creation, Graphic Design, Website Development, Professional Presentations, and other AI-powered digital skills.
              </p>
            </div>

            {/* BOTTOM SIGNATURES & ISSUE DATE SECTION */}
            <div className="relative z-10 grid grid-cols-3 items-end text-center pt-2 sm:pt-4 border-t border-amber-500/20">
              {/* Left Signature: Director */}
              <div className="flex flex-col items-center">
                <svg className="w-28 sm:w-36 h-10 sm:h-12 text-amber-200 drop-shadow-[0_2px_6px_rgba(245,158,11,0.25)]" viewBox="0 0 160 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Executive Director Signature - Smooth Calligraphic Flourish */}
                  <path d="M 16 38 C 12 22, 24 6, 40 10 C 52 13, 44 32, 26 35 C 18 37, 20 25, 36 22 C 54 18, 60 38, 74 30 C 82 25, 88 34, 98 28 C 106 24, 114 30, 126 26" strokeWidth="2.3" />
                  <path d="M 38 32 C 68 28, 102 26, 142 27" strokeWidth="1.8" />
                  <path d="M 58 37 Q 98 33, 132 34" strokeWidth="1.5" />
                  <circle cx="146" cy="27" r="1.8" fill="currentColor" />
                </svg>
                <div className="w-24 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent my-1" />
                <span className="font-sans text-[10px] sm:text-xs font-bold text-slate-200">
                  Director
                </span>
              </div>

              {/* Center: Date of Issue */}
              <div className="flex flex-col items-center justify-end pb-1">
                <span className="font-sans text-[10px] sm:text-xs md:text-sm font-bold text-amber-300 tracking-wider">
                  Date of issue: {issueDate}
                </span>
                <span className="text-[9px] text-amber-400/60 font-mono mt-0.5">
                  Verify: {certId}
                </span>
              </div>

              {/* Right Signature: Founder/CEO */}
              <div className="flex flex-col items-center">
                <svg className="w-28 sm:w-36 h-10 sm:h-12 text-amber-200 drop-shadow-[0_2px_6px_rgba(245,158,11,0.25)]" viewBox="0 0 160 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Founder & CEO Signature - Expressive "Rajababu Mehta" Style Cursive Swirl */}
                  <path d="M 14 36 C 10 14, 28 6, 42 14 C 52 20, 36 38, 22 28 C 14 20, 34 12, 60 18 C 76 22, 88 12, 98 8 C 106 5, 112 18, 104 26 C 96 34, 114 28, 130 20 C 138 16, 144 22, 148 18" strokeWidth="2.3" />
                  <path d="M 28 26 C 58 20, 92 34, 124 24" strokeWidth="1.8" />
                  <path d="M 44 34 Q 88 28, 138 30" strokeWidth="1.5" />
                  <circle cx="152" cy="18" r="1.8" fill="currentColor" />
                </svg>
                <div className="w-24 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent my-1" />
                <span className="font-sans text-[10px] sm:text-xs font-bold text-slate-200">
                  Founder/CEO
                </span>
                <span className="font-sans text-[9px] sm:text-[10px] text-slate-400 font-medium">
                  (AI Clipzone)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Helper Info */}
        <div className="mt-3 text-center text-xs text-slate-400 font-medium print:hidden">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>This is an official verified certificate. Click 'Download Certificate (Direct PNG)' to save instantly to your device.</span>
          </p>
        </div>
      </div>
    </AnimatePresence>
  );
};

