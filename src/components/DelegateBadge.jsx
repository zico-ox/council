import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Printer, CheckCircle, MapPin, Calendar, Building, Sparkles, X, Shield, Phone } from 'lucide-react';
import { EVENT_DETAILS, DESIGNATIONS, UNITS } from '../data/constants';

export default function DelegateBadge({ delegate, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const badgeCardRef = useRef(null);

  const desInfo = DESIGNATIONS.find(d => d.name === delegate.designation) || DESIGNATIONS[0];

  useEffect(() => {
    if (delegate) {
      const qrPayload = JSON.stringify({
        id: delegate.id,
        name: delegate.name,
        unit: delegate.unit,
        role: delegate.designation,
        council: "SSF Velimukku Sector Students Council 2026",
        date: "2026-11-20",
        venue: "Koofa"
      });

      QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0284c7',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('QR code generation failed', err);
      });
    }
  }, [delegate]);

  // Download high-resolution PNG using HTML5 Canvas rendering
  const handleDownloadImage = () => {
    setIsGeneratingImage(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Canvas size (ID Card proportion: 600 x 900 for high resolution)
    const width = 600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Deep Navy to Slate)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#040d21');
    bgGrad.addColorStop(0.5, '#071d49');
    bgGrad.addColorStop(1, '#020b18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric cyan accent lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width, 0, 300, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.beginPath();
    ctx.arc(0, height, 380, 0, Math.PI * 2);
    ctx.stroke();

    // Top Header Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(24, 24, width - 48, 120);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeRect(24, 24, width - 48, 120);

    // Event Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('SSF VELIMUKKU SECTOR', width / 2, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px sans-serif';
    ctx.fillText('STUDENTS COUNCIL 2026', width / 2, 98);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Friday, November 20, 2026 • Venue: Koofa', width / 2, 126);

    // Delegate ID Badge Ribbon
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, 164, 260, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(delegate.id, width / 2, 188);

    // Delegate Name Box
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(delegate.name, width / 2, 255);

    // Designation Tag
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(delegate.designation.toUpperCase(), width / 2, 298);

    // Unit Tag
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 18px sans-serif';
    ctx.fillText(`Unit: ${delegate.unit}`, width / 2, 335);

    if (delegate.mobile) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Mob: +91 ${delegate.mobile}`, width / 2, 365);
    }

    // QR Code Container Box
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 120, 400, 240, 240, 16);
    ctx.fill();

    // Draw QR image
    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        ctx.drawImage(qrImg, width / 2 - 105, 415, 210, 210);

        // Footer details
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.fillRect(24, height - 160, width - 48, 120);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.strokeRect(24, height - 160, width - 48, 120);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('OFFICIAL DELEGATE PASS', width / 2, height - 125);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('SSF Velimukku Sector • Students Center Muttichira', width / 2, height - 98);
        ctx.fillText('Sweetness of Life • Samastha 100 Years', width / 2, height - 74);

        // Download canvas as PNG
        const link = document.createElement('a');
        link.download = `SSF_Council_Pass_${delegate.name.replace(/\s+/g, '_')}_${delegate.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsGeneratingImage(false);
      };
      qrImg.src = qrDataUrl;
    } else {
      setIsGeneratingImage(false);
    }
  };

  // Share to WhatsApp or Web Share API
  const handleShare = async () => {
    const text = `🎓 *SSF VELIMUKKU SECTOR STUDENTS COUNCIL 2026*\n\n` +
      `✅ *Official Delegate Registration Confirmed*\n\n` +
      `👤 *Name:* ${delegate.name}\n` +
      `🆔 *Pass ID:* ${delegate.id}\n` +
      `🏛️ *Unit:* ${delegate.unit}\n` +
      `🎖️ *Designation:* ${delegate.designation}\n` +
      `📅 *Date:* Friday, Nov 20, 2026\n` +
      `📍 *Venue:* Koofa\n\n` +
      `✨ SSF Velimukku Sector Students' Center Muttichira`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SSF Council Pass - ${delegate.name}`,
          text: text
        });
        return;
      } catch (e) {
        // user cancelled or share failed, fallback to whatsapp
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl p-4 sm:p-7 my-auto text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close pass modal"
          className="no-print absolute top-3.5 right-3.5 p-2 rounded-xl bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="no-print text-center mb-4 sm:mb-5 pr-8 pl-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Registration Confirmed!</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Official Delegate Pass
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Save or screenshot this official delegate pass.
          </p>
        </div>

        {/* ================= ID PASS CARD DESIGN ================= */}
        <div 
          ref={badgeCardRef}
          className="print-card relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#061430] via-[#091f4a] to-[#040c1d] border-2 border-cyan-500/40 shadow-2xl p-4 sm:p-6 text-center select-none"
        >
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Badge Brand Bar */}
          <div className="border-b border-cyan-500/30 pb-2.5 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase">
                SSF VELIMUKKU SECTOR
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/40">
                2026
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              STUDENTS COUNCIL
            </h3>
            <p className="text-[10px] sm:text-[11px] text-cyan-200/80 font-medium">
              Friday, November 20, 2026 • Venue: Koofa
            </p>
          </div>

          {/* Delegate ID Ribbon */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-bold mb-3 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>ID: {delegate.id}</span>
          </div>

          {/* Delegate Main Details */}
          <div className="mb-3">
            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow break-words">
              {delegate.name}
            </h4>

            {/* Designation Pill */}
            <div className="mt-1.5 inline-block">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${desInfo.badgeColor}`}>
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>{delegate.designation}</span>
              </span>
            </div>

            {/* Unit Details */}
            <div className="mt-2.5 flex items-center justify-center gap-1 text-slate-200 text-xs sm:text-sm font-semibold">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unit: {delegate.unit}</span>
            </div>

            {delegate.mobile && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>+91 {delegate.mobile}</span>
              </p>
            )}
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg border-2 border-cyan-400/50 my-1">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`QR for ${delegate.id}`} 
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          <div className="text-[10px] text-cyan-400 font-mono mt-1 font-semibold">
            OFFICIAL DELEGATE PASS
          </div>

          {/* Card Footer */}
          <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-left">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Venue: Koofa</span>
            </div>
            <div className="flex items-center gap-1 text-right">
              <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Nov 20, 2026</span>
            </div>
          </div>

          {/* Verification footer */}
          <div className="mt-1.5 text-[9px] sm:text-[10px] text-slate-400">
            SSF Velimukku Sector • Muttichira Students' Center
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print mt-4 sm:mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isGeneratingImage ? 'Saving...' : 'Download'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-white/10 transition active:scale-95"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print</span>
          </button>
        </div>

      </div>
    </div>
  );
}