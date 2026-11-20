import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Printer, CheckCircle, MapPin, Calendar, Building, Sparkles, X, Shield, Phone, Layers } from 'lucide-react';
import { CPB_BLOCKS, DESIGNATIONS } from '../data/constants';

export default function DelegateBadge({ delegate, eventConfig, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const badgeCardRef = useRef(null);

  const isCpb = eventConfig?.hasBlocks || (delegate?.block !== undefined);
  const orgName = isCpb ? 'SSF CHERIYAPARAMB UNIT' : 'SSF VELIMUKKU SECTOR';
  const venueText = isCpb ? '@SSF Office Cheriyaparamb' : 'Koofa';
  const timeText = isCpb ? '06:00 PM' : '';
  const dateFormatted = 'Friday, November 20, 2026';

  const blockInfo = isCpb 
    ? CPB_BLOCKS.find(b => b.name === delegate.block || b.id === delegate.block) || CPB_BLOCKS[0]
    : null;
  const desInfo = !isCpb 
    ? DESIGNATIONS.find(d => d.name === delegate.designation) || DESIGNATIONS[0]
    : null;

  useEffect(() => {
    if (delegate) {
      const qrPayload = JSON.stringify({
        id: delegate.id,
        name: delegate.name,
        ...(isCpb ? { block: delegate.block || 'Block Qadisiyya' } : { unit: delegate.unit, role: delegate.designation }),
        council: `${orgName} Students Council 2026`,
        date: "2026-11-20",
        venue: venueText
      });

      QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 1,
        color: {
          dark: isCpb ? '#059669' : '#0284c7',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('QR code generation failed', err);
      });
    }
  }, [delegate, isCpb, orgName, venueText]);

  // Download high-resolution PNG using HTML5 Canvas rendering
  const handleDownloadImage = () => {
    setIsGeneratingImage(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isCpb) {
      bgGrad.addColorStop(0, '#021e17');
      bgGrad.addColorStop(0.5, '#063f2e');
      bgGrad.addColorStop(1, '#021610');
    } else {
      bgGrad.addColorStop(0, '#040d21');
      bgGrad.addColorStop(0.5, '#071d49');
      bgGrad.addColorStop(1, '#020b18');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative accent rings
    ctx.strokeStyle = isCpb ? 'rgba(16, 185, 129, 0.25)' : 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width, 0, 300, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = isCpb ? 'rgba(20, 184, 166, 0.2)' : 'rgba(59, 130, 246, 0.2)';
    ctx.beginPath();
    ctx.arc(0, height, 380, 0, Math.PI * 2);
    ctx.stroke();

    // Top Header Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(24, 24, width - 48, 120);
    ctx.strokeStyle = isCpb ? 'rgba(52, 211, 153, 0.3)' : 'rgba(56, 189, 248, 0.3)';
    ctx.strokeRect(24, 24, width - 48, 120);

    // Event Title
    ctx.textAlign = 'center';
    ctx.fillStyle = isCpb ? '#34d399' : '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(orgName, width / 2, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px sans-serif';
    ctx.fillText('STUDENTS COUNCIL 2026', width / 2, 98);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${dateFormatted} ${timeText ? `• ${timeText}` : ''} • Venue: ${venueText}`, width / 2, 126);

    // Delegate ID Badge Ribbon
    ctx.fillStyle = isCpb ? '#059669' : '#0284c7';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, 164, 260, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(delegate.id, width / 2, 188);

    // Delegate Name Box
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(delegate.name, width / 2, 252);

    if (isCpb) {
      // CPB Mode: Block Tag & Road Subtext
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText((delegate.block || 'Block Qadisiyya').toUpperCase(), width / 2, 295);

      if (blockInfo?.subtext) {
        ctx.fillStyle = '#a7f3d0';
        ctx.font = '600 15px sans-serif';
        ctx.fillText(`(${blockInfo.subtext})`, width / 2, 322);
      }

      // Cheriyaparamb Unit Tag
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 17px sans-serif';
      ctx.fillText('Unit: Cheriyaparamb', width / 2, 350);
    } else {
      // VLM Mode: Designation Tag
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText((delegate.designation || '').toUpperCase(), width / 2, 298);

      // Unit Tag
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 18px sans-serif';
      ctx.fillText(`Unit: ${delegate.unit}`, width / 2, 335);
    }

    if (delegate.mobile) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Mob: +91 ${delegate.mobile}`, width / 2, 380);
    }

    // QR Code Container Box
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 115, 415, 230, 230, 16);
    ctx.fill();

    // Draw QR image
    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        ctx.drawImage(qrImg, width / 2 - 100, 430, 200, 200);

        // Footer details
        ctx.fillStyle = isCpb ? 'rgba(5, 150, 105, 0.15)' : 'rgba(6, 182, 212, 0.15)';
        ctx.fillRect(24, height - 160, width - 48, 120);
        ctx.strokeStyle = isCpb ? 'rgba(5, 150, 105, 0.3)' : 'rgba(6, 182, 212, 0.3)';
        ctx.strokeRect(24, height - 160, width - 48, 120);

        ctx.fillStyle = isCpb ? '#34d399' : '#38bdf8';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('OFFICIAL DELEGATE PASS', width / 2, height - 125);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        if (isCpb) {
          ctx.fillText('SSF Cheriyaparamb Unit • Students Centre Cheriyaparamb', width / 2, height - 98);
        } else {
          ctx.fillText('SSF Velimukku Sector • Students Center Muttichira', width / 2, height - 98);
        }
        ctx.fillText('Sweetness of Life • Samastha 100 Years', width / 2, height - 74);

        // Download canvas as PNG
        const link = document.createElement('a');
        link.download = `${isCpb ? 'SSF_CPB' : 'SSF_VLM'}_Council_Pass_${delegate.name.replace(/\s+/g, '_')}_${delegate.id}.png`;
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
    let text = '';
    if (isCpb) {
      text = `🎓 *SSF CHERIYAPARAMB UNIT STUDENTS COUNCIL 2026*\n\n` +
        `✅ *Official Delegate Registration Confirmed*\n\n` +
        `👤 *Name:* ${delegate.name}\n` +
        `🆔 *Pass ID:* ${delegate.id}\n` +
        `🏢 *Block:* ${delegate.block || 'Block Qadisiyya'} ${blockInfo?.subtext ? `(${blockInfo.subtext})` : ''}\n` +
        `📅 *Date:* Friday, Nov 20, 2026 (06:00 PM)\n` +
        `📍 *Venue:* @SSF Office Cheriyaparamb\n\n` +
        `✨ SSF Cheriyaparamb Unit Students Centre`;
    } else {
      text = `🎓 *SSF VELIMUKKU SECTOR STUDENTS COUNCIL 2026*\n\n` +
        `✅ *Official Delegate Registration Confirmed*\n\n` +
        `👤 *Name:* ${delegate.name}\n` +
        `🆔 *Pass ID:* ${delegate.id}\n` +
        `🏛️ *Unit:* ${delegate.unit}\n` +
        `🎖️ *Designation:* ${delegate.designation}\n` +
        `📅 *Date:* Friday, Nov 20, 2026\n` +
        `📍 *Venue:* Koofa\n\n` +
        `✨ SSF Velimukku Sector Students' Center Muttichira`;
    }

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

  const modalBorder = isCpb ? 'border-emerald-500/30' : 'border-cyan-500/30';
  const cardBorder = isCpb ? 'border-emerald-500/40' : 'border-cyan-500/40';
  const accentText = isCpb ? 'text-emerald-400' : 'text-cyan-400';
  const ribbonBg = isCpb ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className={`relative w-full max-w-md bg-slate-900 border ${modalBorder} rounded-3xl shadow-2xl p-4 sm:p-7 my-auto text-white`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close pass modal"
          className="no-print absolute top-3.5 right-3.5 p-2 rounded-xl bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
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
          className={`print-card relative overflow-hidden rounded-2xl ${
            isCpb 
              ? 'bg-gradient-to-b from-[#021f17] via-[#053526] to-[#021610]' 
              : 'bg-gradient-to-b from-[#061430] via-[#091f4a] to-[#040c1d]'
          } border-2 ${cardBorder} shadow-2xl p-4 sm:p-6 text-center select-none`}
        >
          {/* Decorative Corner Glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${isCpb ? 'bg-emerald-500/15' : 'bg-cyan-500/10'} rounded-full blur-2xl pointer-events-none`}></div>
          <div className={`absolute bottom-0 left-0 w-32 h-32 ${isCpb ? 'bg-teal-500/15' : 'bg-blue-500/10'} rounded-full blur-2xl pointer-events-none`}></div>

          {/* Top Badge Brand Bar */}
          <div className={`border-b ${isCpb ? 'border-emerald-500/30' : 'border-cyan-500/30'} pb-2.5 mb-3`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] sm:text-[11px] font-extrabold tracking-widest ${accentText} uppercase`}>
                {orgName}
              </span>
              <span className={`text-[10px] ${isCpb ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'} font-bold px-2 py-0.5 rounded-full border`}>
                2026
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              STUDENTS COUNCIL
            </h3>
            <p className={`text-[10px] sm:text-[11px] ${isCpb ? 'text-emerald-200/80' : 'text-cyan-200/80'} font-medium`}>
              {dateFormatted} {timeText ? `• ${timeText}` : ''} • Venue: {venueText}
            </p>
          </div>

          {/* Delegate ID Ribbon */}
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${ribbonBg} text-xs font-mono font-bold mb-3 shadow-sm border`}>
            <Shield className="w-3.5 h-3.5" />
            <span>{delegate.id}</span>
          </div>

          {/* Delegate Name */}
          <div className="mb-2">
            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {delegate.name}
            </h4>
          </div>

          {/* Role or Block Badge */}
          <div className="mb-2.5">
            {isCpb ? (
              <div className="inline-flex flex-col items-center">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold border ${blockInfo?.badgeColor || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'} shadow-sm`}>
                  <Layers className="w-3.5 h-3.5" />
                  <span>{(delegate.block || 'Block Qadisiyya').toUpperCase()}</span>
                </span>
                {blockInfo?.subtext && (
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1">
                    {blockInfo.subtext}
                  </span>
                )}
              </div>
            ) : (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${desInfo?.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'} shadow-sm`}>
                <span>{delegate.designation}</span>
              </span>
            )}
          </div>

          {/* Unit / Details */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-300 mb-3">
            <span className="flex items-center gap-1 font-medium">
              <Building className={`w-3.5 h-3.5 ${accentText}`} />
              <span>{isCpb ? 'SSF Cheriyaparamb Unit' : delegate.unit}</span>
            </span>
            {delegate.mobile && (
              <>
                <span>•</span>
                <span className="font-mono text-slate-400 font-semibold">
                  +91 {delegate.mobile}
                </span>
              </>
            )}
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl max-w-[170px] mx-auto shadow-xl mb-3 flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${delegate.name}`}
                className="w-full h-auto aspect-square object-contain"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-lg">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Card Footer Banner */}
          <div className={`pt-2 border-t ${isCpb ? 'border-emerald-500/20 text-emerald-300/80' : 'border-cyan-500/20 text-cyan-300/80'} text-[10px] font-semibold flex items-center justify-between`}>
            <span>{isCpb ? 'CHERIYAPARAMB UNIT' : 'VELIMUKKU SECTOR'}</span>
            <span>VERIFIED PASS</span>
          </div>

        </div>

        {/* Modal Action Buttons: Download PNG, WhatsApp Share, Print */}
        <div className="no-print mt-4 sm:mt-5 grid grid-cols-3 gap-2">
          
          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage || !qrDataUrl}
            className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl ${
              isCpb ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'
            } text-white font-bold text-xs transition active:scale-95 shadow-lg disabled:opacity-50 cursor-pointer`}
          >
            {isGeneratingImage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Save Image</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>

        </div>

      </div>
    </div>
  );
}
