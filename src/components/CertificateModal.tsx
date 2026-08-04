import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, CheckCircle, Share2, ShieldCheck, Award, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { LOGO_DATA_URL } from '../logo';

interface CertificateModalProps {
  studentName: string;
  courseTitle: string;
  issueDate?: string;
  certificateId?: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName = 'Student Learner',
  courseTitle,
  issueDate = '2083/01/14',
  certificateId: initialCertId,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Stable certificate code calculation that never changes randomly on re-renders or page updates
  const [certId] = useState(() => {
    if (initialCertId && initialCertId.trim()) {
      return initialCertId.trim();
    }
    const cleanName = (studentName || 'Student').trim();
    const cleanTitle = (courseTitle || 'Course').trim();
    const storageKey = `clipzone_cert_code_${cleanName}_${cleanTitle}`;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return saved;
    } catch (e) {}

    // Check if there is an active activation code saved locally
    try {
      const activeCodes = JSON.parse(localStorage.getItem('clipzone_active_codes') || '[]');
      if (Array.isArray(activeCodes) && activeCodes.length > 0 && activeCodes[0]) {
        try { localStorage.setItem(storageKey, activeCodes[0]); } catch (e) {}
        return activeCodes[0];
      }
    } catch (e) {}

    // Fixed hash fallback code (deterministic)
    let hash = 0;
    const str = `${cleanName}_${cleanTitle}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const codeNum = Math.abs(hash) % 900000 + 100000;
    const stableCode = `CLIP-${codeNum}`;
    try {
      localStorage.setItem(storageKey, stableCode);
    } catch (e) {}
    return stableCode;
  });

  const cleanCourseTitle = (courseTitle || 'AI CONTENT CREATION & DIGITAL DESIGN MASTERCLASS')
    .replace(/by Dhruv Rathee/gi, 'by AI Clipzone')
    .replace(/Dhruv Rathee/gi, 'AI Clipzone');

  // Auto-scale certificate canvas to fit user's modal screen smoothly (mobile or desktop)
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 16;
        const targetWidth = 1000;
        const newScale = Math.min(1, Math.max(0.28, containerWidth / targetWidth));
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    setIsDownloading(true);
    try {
      const node = document.getElementById('certificate-print-area');
      if (!node) return;

      // Ensure document fonts are fully loaded before capturing
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => {});
      }

      // Save original transform style
      const origTransform = node.style.transform;
      const origTransformOrigin = node.style.transformOrigin;

      // Reset transform to 1:1 (full 1000x707 px) for capture
      node.style.transform = 'none';

      // Brief delay to allow layout recalculation
      await new Promise((resolve) => setTimeout(resolve, 80));

      let dataUrl = '';
      try {
        // High-res PNG export capturing exact 1000x707 canvas at 2.5x pixelRatio (2500x1767px 4K crisp)
        dataUrl = await toPng(node, {
          quality: 1.0,
          pixelRatio: 2.5,
          cacheBust: true,
          width: 1000,
          height: 707,
        });
      } catch (firstErr) {
        console.warn('Initial toPng failed, trying fallback mode:', firstErr);
        dataUrl = await toPng(node, {
          quality: 0.95,
          pixelRatio: 2.0,
          width: 1000,
          height: 707,
        });
      }

      // Restore original container transform
      node.style.transform = origTransform;
      node.style.transformOrigin = origTransformOrigin;

      if (dataUrl) {
        const link = document.createElement('a');
        const sanitizedName = (studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
        link.download = `AI_Clipzone_Certificate_${sanitizedName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download error:', err);
      // Fallback smoothly to browser print/save PDF if PNG canvas is strictly blocked
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
              transform: none !important;
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

        {/* MAIN CERTIFICATE CANVAS SCALED CONTAINER */}
        <div ref={containerRef} className="w-full flex-1 flex flex-col items-center justify-center my-auto py-2 px-1 overflow-hidden">
          <div 
            style={{ 
              width: `${1000 * scale}px`, 
              height: `${707 * scale}px`,
            }} 
            className="relative flex items-center justify-center shrink-0 transition-all duration-150"
          >
            <div
              id="certificate-print-area"
              style={{
                width: '1000px',
                height: '707px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                backgroundImage: 'radial-gradient(circle at center, #0f1c42 0%, #060b1e 80%)',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), inset 0 0 80px rgba(197,155,39,0.15)',
              }}
              className="absolute top-0 left-0 bg-[#060b1e] rounded-2xl p-10 shadow-2xl overflow-hidden border-4 border-[#c59b27] flex flex-col justify-between text-center select-none font-sans shrink-0"
            >
              {/* Embedded Font Definitions for Image Capture Canvas Engine */}
              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,800;1,700&display=swap');
                .cert-font-script { font-family: 'Great Vibes', 'Playfair Display', Georgia, cursive, serif !important; }
                .cert-font-cinzel { font-family: 'Cinzel', 'Playfair Display', Georgia, serif !important; }
                .cert-font-playfair { font-family: 'Playfair Display', Georgia, serif !important; }
              `}</style>

              {/* Outer Luxury Metallic Border Multi-Layers */}
              <div className="absolute inset-3 border-2 border-[#e6c663] rounded-lg pointer-events-none opacity-90" />
              <div className="absolute inset-4 border border-[#8a6a18] rounded-md pointer-events-none opacity-80" />

              {/* Corner Ornate Baroque Flourish Decorations (4 Corners) */}
              <svg className="absolute top-3 left-3 w-16 h-16 text-[#e6c663] opacity-85 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
                <circle cx="20" cy="20" r="3" />
                <path d="M0,0 L35,0 C20,0 0,20 0,35 Z M0,0 L0,35 C0,20 20,0 35,0 Z" />
              </svg>
              <svg className="absolute top-3 right-3 w-16 h-16 text-[#e6c663] opacity-85 pointer-events-none transform rotate-90" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
                <circle cx="20" cy="20" r="3" />
              </svg>
              <svg className="absolute bottom-3 left-3 w-16 h-16 text-[#e6c663] opacity-85 pointer-events-none transform -rotate-90" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
                <circle cx="20" cy="20" r="3" />
              </svg>
              <svg className="absolute bottom-3 right-3 w-16 h-16 text-[#e6c663] opacity-85 pointer-events-none transform rotate-180" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10,10 L40,10 C25,10 10,25 10,40 Z M15,15 L15,50 C15,30 30,15 50,15 L15,15 Z" />
                <circle cx="20" cy="20" r="3" />
              </svg>

              {/* Background Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                <span className="cert-font-cinzel text-[160px] font-black text-[#e6c663] tracking-widest uppercase">
                  Ai
                </span>
              </div>

              {/* HEADER SECTION: LOGO (TOP LEFT) & MAIN TITLE (CENTERED EQUALLY) */}
              <div className="relative z-10 flex items-center justify-between w-full px-4 pt-1">
                {/* Prominent Official Gold Ai Clipzone Emblem Badge (Top Left) */}
                <div className="w-32 shrink-0 flex items-center justify-start">
                  <div className="w-28 h-28 rounded-full border-3 border-[#e6c663] p-0.5 flex items-center justify-center shadow-2xl bg-[#0a122c] shrink-0 overflow-hidden relative">
                    <img 
                      src={LOGO_DATA_URL} 
                      alt="AI Clipzone Logo"
                      className="w-full h-full object-cover filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.7)]"
                    />
                  </div>
                </div>

                {/* CENTER TITLE: CERTIFICATE OF ACHIEVEMENT */}
                <div className="flex-1 text-center px-2">
                  <h1
                    className="cert-font-cinzel text-5xl font-black tracking-[0.18em] uppercase drop-shadow-md text-[#fef08a]"
                    style={{ textShadow: '0 2px 10px rgba(245, 158, 11, 0.35)' }}
                  >
                    CERTIFICATE
                  </h1>
                  <h2
                    className="cert-font-cinzel text-base font-black tracking-[0.35em] uppercase mt-1 text-[#fcd34d]"
                  >
                    OF ACHIEVEMENT
                  </h2>
                </div>

                {/* Right Spacer to Balance Emblem Width & Maintain Pure Center Title Alignment */}
                <div className="w-32 shrink-0" />
              </div>

              {/* CERTIFICATION BODY STATEMENT */}
              <div className="relative z-10 py-1 px-8 my-auto">
                <p className="font-serif italic text-slate-300 text-xl tracking-wide">
                  This is to certify that
                </p>

                {/* STUDENT CALLIGRAPHIC NAME */}
                <div className="my-2 relative block w-full max-w-full px-4 text-center">
                  <h2
                    className="cert-font-script text-7xl font-bold tracking-wide leading-tight px-2 block mx-auto text-[#fef08a]"
                    style={{
                      fontFamily: "'Great Vibes', 'Playfair Display', Georgia, cursive, serif",
                      color: '#fef08a',
                      textShadow: '0 2px 14px rgba(245, 158, 11, 0.5)',
                    }}
                  >
                    {studentName}
                  </h2>

                  {/* Golden Horizontal Divider Line with Flourish Tips & Center Sparkle */}
                  <div className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 mt-1">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#e6c663] to-[#e6c663]" />
                    <span className="text-amber-300 text-base font-serif">♦ ✦ ♦</span>
                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#e6c663] to-[#e6c663]" />
                  </div>
                </div>

                {/* ACHIEVEMENT STATEMENT */}
                <p
                  className="cert-font-cinzel text-base font-bold tracking-[0.25em] uppercase mt-2 text-[#fcd34d]"
                >
                  HAS SUCCESSFULLY COMPLETED
                </p>

                {/* COURSE TITLE */}
                <h3
                  className="font-sans font-black text-3xl tracking-wider uppercase my-2 leading-snug max-w-3xl mx-auto px-4 text-[#fef08a]"
                  style={{ textShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' }}
                >
                  {cleanCourseTitle}
                </h3>

                {/* COURSE DESCRIPTION SUMMARY */}
                <p className="text-slate-300/90 text-base font-normal max-w-2xl mx-auto leading-relaxed px-4 my-1">
                  an advanced training in 30+ AI Tools covering AI Video Creation, AI Image Generation, AI Music & Song Creation, Graphic Design, Website Development, Professional Presentations, and other AI-powered digital skills.
                </p>
              </div>

              {/* BOTTOM SIGNATURES & ISSUE DATE SECTION */}
              <div className="relative z-10 grid grid-cols-3 items-end text-center pt-2 border-t border-amber-500/20 px-6 pb-1">
                {/* Left Signature: Director */}
                <div className="flex flex-col items-center">
                  <svg className="w-40 h-12 text-[#fef08a] drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]" viewBox="0 0 180 55" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    {/* Calligraphic Executive Director Signature */}
                    <path d="M 22 42 C 14 38, 12 12, 28 8 C 42 5, 40 38, 25 44 C 18 47, 24 24, 46 20 C 62 17, 56 36, 72 28 C 80 24, 84 32, 96 26 C 104 22, 112 30, 128 24" strokeWidth="2.4" />
                    <path d="M 120 18 Q 138 12, 148 22 Q 132 38, 108 42 C 80 47, 130 42, 162 40" strokeWidth="1.8" />
                    <circle cx="166" cy="39" r="1.8" fill="currentColor" />
                  </svg>
                  <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent my-1" />
                  <span className="font-sans text-sm font-bold text-slate-200">
                    Director
                  </span>
                </div>

                {/* Center: Date of Issue */}
                <div className="flex flex-col items-center justify-end pb-1">
                  <span className="font-sans text-sm font-bold text-amber-300 tracking-wider">
                    Date of issue: {issueDate}
                  </span>
                  <span className="text-xs text-amber-400/70 font-mono mt-0.5">
                    Verify: {certId}
                  </span>
                </div>

                {/* Right Signature: Founder/CEO */}
                <div className="flex flex-col items-center">
                  <svg className="w-40 h-12 text-[#fef08a] drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]" viewBox="0 0 180 55" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    {/* Elegant CEO Loop & Underline Flourish */}
                    <path d="M 18 45 C 10 18, 30 4, 48 10 C 62 15, 42 42, 28 32 C 18 24, 38 10, 68 18 C 88 23, 80 38, 98 28 C 110 21, 118 32, 134 22 C 144 16, 150 24, 158 20" strokeWidth="2.5" />
                    <path d="M 32 36 C 65 28, 110 26, 152 32 C 165 34, 172 30, 166 26 C 158 21, 145 28, 135 34 C 120 42, 148 44, 170 42" strokeWidth="1.7" />
                    <circle cx="174" cy="41" r="1.8" fill="currentColor" />
                  </svg>
                  <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent my-1" />
                  <span className="font-sans text-sm font-bold text-slate-200">
                    Founder/CEO
                  </span>
                  <span className="font-sans text-xs text-slate-400 font-medium">
                    (AI Clipzone)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Helper Info */}
        <div className="mt-3 text-center text-xs text-slate-400 font-medium print:hidden">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official digital credential verified by AI Clipzone. Download high-resolution PNG or print directly.</span>
          </p>
        </div>
      </div>
    </AnimatePresence>
  );
};
