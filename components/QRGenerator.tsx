'use client';

import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  generateQRPayload, 
  generateCombinedVpa, 
  getPaymentDetails, 
  PaymentDetails,
  SUPPORTED_BANKS 
} from '@/lib/qrPayload';
import { 
  QrCode, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Smartphone, 
  CreditCard,
  Building,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Copy,
  Check,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface FormState {
  name: string;
  mobileNumber: string;
  cardNumber: string;
  bankId: string;
}

interface FormErrors {
  name?: string;
  mobileNumber?: string;
  cardNumber?: string;
  bankId?: string;
}

export default function QRGenerator() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    mobileNumber: '',
    cardNumber: '',
    bankId: 'axis',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [K in keyof FormState]?: boolean }>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live combined ID preview: Cc.91<mobile><card>@bank
  const liveCombinedId = generateCombinedVpa(
    formData.mobileNumber || 'XXXXXXXXXX',
    formData.cardNumber || 'XXXX',
    formData.bankId
  );

  // Live payload preview
  const livePayloadPreview = generateQRPayload({
    name: formData.name || 'CardholderName',
    mobileNumber: formData.mobileNumber || 'XXXXXXXXXX',
    cardNumber: formData.cardNumber || 'XXXX',
    bankId: formData.bankId
  });

  // Selected bank object
  const selectedBank = SUPPORTED_BANKS.find((b) => b.id === formData.bankId) || SUPPORTED_BANKS[0];

  // Form validation
  const validate = (data: FormState): FormErrors => {
    const newErrors: FormErrors = {};

    // 1. Name validation
    const cleanName = data.name.trim();
    if (!cleanName) {
      newErrors.name = 'Cardholder name is required';
    } else if (cleanName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.]+$/.test(cleanName)) {
      newErrors.name = 'Letters and spaces only';
    }

    // 2. Mobile Number validation
    const cleanMobile = data.mobileNumber.trim();
    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d+$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Only digits allowed';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobileNumber = `Must be 10 digits (${cleanMobile.length}/10)`;
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Must start with 6, 7, 8, or 9';
    }

    // 3. 4-Digit Card Number validation
    const cleanCard = data.cardNumber.trim();
    if (!cleanCard) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d+$/.test(cleanCard)) {
      newErrors.cardNumber = 'Digits only';
    } else if (cleanCard.length !== 4) {
      newErrors.cardNumber = `Must be 4 digits (${cleanCard.length}/4)`;
    }

    // 4. Bank select validation
    if (!data.bankId) {
      newErrors.bankId = 'Please select a bank';
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    let sanitizedValue = value;

    if (field === 'name') {
      sanitizedValue = value.replace(/[^a-zA-Z\s.]/g, '').slice(0, 50);
    } else if (field === 'mobileNumber') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'cardNumber') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    const updatedData = { ...formData, [field]: sanitizedValue };
    setFormData(updatedData);

    if (touched[field]) {
      const currentErrors = validate(updatedData);
      setErrors((prev) => ({
        ...prev,
        [field]: currentErrors[field],
      }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: currentErrors[field],
    }));
  };

  const generateQR = async (data: FormState) => {
    setIsGenerating(true);
    try {
      const payloadString = generateQRPayload(data);
      const details = getPaymentDetails(data);
      setPaymentDetails(details);

      const url = await QRCode.toDataURL(payloadString, {
        width: 512,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });

      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      mobileNumber: true,
      cardNumber: true,
      bankId: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await generateQR(formData);
  };

  // Auto generate initial sample or update if already generated
  const handleQuickFillSample = () => {
    const sample: FormState = {
      name: 'Abhinandan',
      mobileNumber: '9569199900',
      cardNumber: '8696',
      bankId: 'axis',
    };
    setFormData(sample);
    setErrors({});
    generateQR(sample);
  };

  const handleCopyUpiId = () => {
    const idToCopy = paymentDetails ? paymentDetails.combinedId : liveCombinedId;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyLink = () => {
    const linkToCopy = paymentDetails ? paymentDetails.rawUri : livePayloadPreview;
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl || !paymentDetails) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const padding = 32;
      const headerHeight = 126;
      const footerHeight = 100;
      const qrSize = 360;

      canvas.width = qrSize + padding * 2;
      canvas.height = qrSize + padding * 2 + headerHeight + footerHeight;

      if (ctx) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(0, 0, canvas.width, canvas.height, 24);
        ctx.fill();

        // Top Header Accent Bar
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#97144d'); // Axis Maroon
        gradient.addColorStop(0.5, '#2563eb'); // Blue
        gradient.addColorStop(1, '#06b6d4'); // Cyan
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, 10);

        // Header Title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CREDIT CARD UPI PAYMENT', canvas.width / 2, 40);

        // Payee Name Display
        if (paymentDetails.name) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
          ctx.fillText(`Payee: ${paymentDetails.name}`, canvas.width / 2, 66);
        }

        // Formatted UPI ID Display
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 15px monospace, system-ui, sans-serif';
        ctx.fillText(`UPI ID: ${paymentDetails.combinedId}`, canvas.width / 2, paymentDetails.name ? 92 : 72);

        // Bank info subtitle
        ctx.fillStyle = '#64748b';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillText(`${paymentDetails.bankName} • Ending ${paymentDetails.cardNumber}`, canvas.width / 2, paymentDetails.name ? 114 : 96);

        // QR Box Frame
        ctx.fillStyle = '#f8fafc';
        ctx.roundRect(padding - 6, headerHeight + padding - 6, qrSize + 12, qrSize + 12, 16);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // QR Image
        ctx.drawImage(img, padding, headerHeight + padding, qrSize, qrSize);

        // Footer App Info
        const footerStartY = headerHeight + padding + qrSize + 22;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillText('Accepted on Any UPI App:', canvas.width / 2, footerStartY);

        ctx.fillStyle = '#64748b';
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.fillText('Google Pay • PhonePe • Paytm • BHIM • CRED • Bank Apps', canvas.width / 2, footerStartY + 20);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui, -apple-system, sans-serif';
        ctx.fillText('NPCI Instant UPI Credit Card Standard', canvas.width / 2, footerStartY + 40);

        const fullImageUri = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const safeName = (paymentDetails.name || 'Card').replace(/\s+/g, '_');
        link.download = `ScanQR_${safeName}_${paymentDetails.cardNumber}.png`;
        link.href = fullImageUri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    img.src = qrDataUrl;
  };

  const handleReset = () => {
    setFormData({
      name: '',
      mobileNumber: '',
      cardNumber: '',
      bankId: 'axis',
    });
    setErrors({});
    setTouched({});
    setQrDataUrl(null);
    setPaymentDetails(null);
    setCopiedId(false);
    setCopiedLink(false);
  };

  const handlePageRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const isFormFilled = Boolean(
    formData.name.trim() &&
    formData.mobileNumber.length === 10 &&
    formData.cardNumber.length === 4
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Top Navbar Header */}
      <header className="flex items-center justify-between mb-4 sm:mb-5 px-4 py-3 bg-white rounded-2xl border border-slate-200/70 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">ScanQR</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                NPCI Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Instant Credit Card UPI Payment Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Page Button (Larger & Blue) */}
          <button
            type="button"
            id="refresh-page-btn"
            onClick={handlePageRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            title="Refresh screen"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            id="fill-sample-btn"
            onClick={handleQuickFillSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Load sample Abhinandan 9569199900 8696"
          >
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Fill</span> Sample
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Client-side Secure</span>
          </div>
        </div>
      </header>

      {/* Main 2-Section Grid Layout (Left: Form, Right: Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ================= LEFT SECTION: FORM ================= */}
        <section className="lg:col-span-6 xl:col-span-6 flex flex-col">
          <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/70 p-5 sm:p-6 flex flex-col justify-between">
            
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Payment Details
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">All fields required</span>
              </div>

              {/* Form Elements */}
              <form onSubmit={handleGenerate} noValidate className="space-y-4">
                
                {/* Field 1: Cardholder Name */}
                <div className="space-y-1">
                  <label 
                    htmlFor="name" 
                    className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Cardholder Name
                    </span>
                    <span className="text-[10px] font-normal text-slate-400 font-mono">pn param</span>
                  </label>
                  
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Abhinandan"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={`w-full px-3.5 py-2.5 text-slate-900 bg-slate-50/70 rounded-xl border transition-all duration-200 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.name && touched.name
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-300'
                      }`}
                    />
                    {formData.name.trim().length >= 2 && !errors.name && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {errors.name && touched.name && (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 pt-0.5 animate-fadeIn">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>

                {/* Field 2: Registered Mobile Number */}
                <div className="space-y-1">
                  <label 
                    htmlFor="mobileNumber" 
                    className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      CC Mobile Number
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">10 Digits</span>
                  </label>
                  
                  <div className="relative flex rounded-xl border transition-all duration-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-center px-3 bg-blue-50/80 border-r border-slate-200 text-blue-700 font-mono font-bold text-xs select-none">
                      +91
                    </div>
                    
                    <input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="e.g. 9569199900"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      onBlur={() => handleBlur('mobileNumber')}
                      className="w-full px-3 py-2.5 text-slate-900 bg-transparent placeholder:text-slate-400 text-sm focus:outline-none font-mono"
                    />

                    {formData.mobileNumber.length === 10 && !errors.mobileNumber && (
                      <div className="flex items-center pr-3 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {errors.mobileNumber && touched.mobileNumber && (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 pt-0.5 animate-fadeIn">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{errors.mobileNumber}</span>
                    </div>
                  )}
                </div>

                {/* Field 3: 4-Digit Card Number & Field 4: Bank in a 2-Column Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Card Last 4 Digits */}
                  <div className="space-y-1">
                    <label 
                      htmlFor="cardNumber" 
                      className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        Last 4 Digits
                      </span>
                    </label>
                    
                    <div className="relative">
                      <input
                        id="cardNumber"
                        name="cardNumber"
                        type="tel"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="e.g. 8696"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        onBlur={() => handleBlur('cardNumber')}
                        className={`w-full px-3.5 py-2.5 text-slate-900 bg-slate-50/70 rounded-xl border transition-all duration-200 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 font-mono ${
                          errors.cardNumber && touched.cardNumber
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-300'
                        }`}
                      />
                      {formData.cardNumber.length === 4 && !errors.cardNumber && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {errors.cardNumber && touched.cardNumber && (
                      <div className="flex items-center gap-1 text-[11px] text-red-600 pt-0.5 animate-fadeIn">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{errors.cardNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Bank Select */}
                  <div className="space-y-1">
                    <label 
                      htmlFor="bankId" 
                      className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        Select Bank
                      </span>
                      <span className="text-[10px] text-blue-600 font-mono truncate max-w-[80px]">
                        {selectedBank.vpaSuffix}
                      </span>
                    </label>

                    <div className="relative">
                      <select
                        id="bankId"
                        name="bankId"
                        value={formData.bankId}
                        onChange={(e) => handleInputChange('bankId', e.target.value)}
                        className="w-full px-3 py-2.5 text-slate-900 bg-slate-50/70 rounded-xl border border-slate-200 transition-all duration-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-300 cursor-pointer appearance-none font-medium"
                      >
                        {SUPPORTED_BANKS.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name} ({bank.vpaSuffix})
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Strip */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3 text-blue-600" />
                      Live UPI ID Preview:
                    </span>
                    <span className="font-mono font-bold text-blue-600 truncate max-w-[200px]">
                      {liveCombinedId}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 bg-white p-1.5 rounded-lg border border-slate-200 truncate flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{livePayloadPreview}</span>
                  </div>
                </div>

                {/* Submit & Reset Buttons */}
                <div className="pt-1 flex gap-2">
                  <button
                    type="submit"
                    id="generate-qr-btn"
                    disabled={isGenerating}
                    className="flex-1 relative group overflow-hidden rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>{isGenerating ? 'Generating...' : 'Generate QR Code'}</span>
                    {!isGenerating && (
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  <button
                    type="button"
                    id="reset-form-btn"
                    onClick={handleReset}
                    className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors duration-150 flex items-center justify-center"
                    title="Reset form"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Form Footer */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Zero data saved on servers
              </span>
              <span>NPCI Format v2.0</span>
            </div>
          </div>
        </section>

        {/* ================= RIGHT SECTION: OUTPUT ================= */}
        <section className="lg:col-span-6 xl:col-span-6 flex flex-col">
          <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/70 p-5 sm:p-6 flex flex-col justify-between">
            
            <div>
              {/* Output Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${qrDataUrl ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Generated QR Output
                  </h2>
                </div>

                {qrDataUrl && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                    Ready to Scan
                  </span>
                )}
              </div>

              {!qrDataUrl || !paymentDetails ? (
                /* Interactive Placeholder when not generated */
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 flex flex-col items-center justify-center min-h-[310px]">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mb-3 group-hover:scale-105 transition-transform">
                    <QrCode className="w-8 h-8 stroke-[1.5] text-blue-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No QR Code Generated Yet</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Fill the form on the left or click <button onClick={handleQuickFillSample} className="text-blue-600 underline font-semibold">Fill Sample</button> to generate your instant QR code.
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 w-full max-w-xs text-left">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Target Format Output:</p>
                    <code className="block text-[11px] font-mono text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80 truncate">
                      upi://pay?pa=Cc.91...&pn=...
                    </code>
                  </div>
                </div>
              ) : (
                /* Generated QR Code & Details */
                <div className="space-y-3.5 animate-fadeIn">
                  
                  {/* "Your scanner is ready • Scan me" Capsule Badge */}
                  <div className="flex items-center justify-center animate-qrPop">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300/80 text-emerald-800 text-xs font-semibold shadow-sm animate-pulseGlow">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Your scanner is ready • Scan me</span>
                    </div>
                  </div>

                  {/* Top Badge: Payee Name & Bank */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">{paymentDetails.name}</span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      {paymentDetails.bankName} (Ending {paymentDetails.cardNumber})
                    </span>
                  </div>

                  {/* QR Image Frame & UPI ID with Pop-up Animation */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 animate-qrPop">
                    
                    {/* QR Canvas Box with corner brackets & sweeping beam */}
                    <div className="relative p-2.5 bg-white rounded-xl shadow-md border border-slate-200/90 flex-shrink-0 overflow-hidden group">
                      {/* Laser scanning line */}
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-laserScan pointer-events-none z-10" />

                      {/* HUD Corner Brackets */}
                      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm pointer-events-none" />
                      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm pointer-events-none" />
                      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm pointer-events-none" />
                      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-500 rounded-br-sm pointer-events-none" />

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrDataUrl}
                        alt={`QR Code for ${paymentDetails.combinedId}`}
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    {/* QR Meta Details */}
                    <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">UPI ID</span>
                        <div 
                          onClick={handleCopyUpiId}
                          className="group cursor-pointer inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                        >
                          <span className="break-all">{paymentDetails.combinedId}</span>
                          <span className="p-1 rounded bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                            {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </span>
                        </div>
                        {copiedId && (
                          <div className="text-[10px] font-semibold text-emerald-600 animate-fadeIn">
                            ✓ Copied to clipboard
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Scan with any App</span>
                        <p className="text-[11px] text-slate-600 font-medium">
                          GPay • PhonePe • Paytm • BHIM • CRED
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Output Payload URI Bar */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-left">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-blue-600" />
                        UPI URI Output
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="text-blue-600 hover:text-blue-700 font-mono text-[11px] flex items-center gap-1"
                      >
                        {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-slate-800 break-all bg-white p-2 rounded-lg border border-slate-200/80">
                      {paymentDetails.rawUri}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      id="download-qr-btn"
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Poster</span>
                    </button>

                    <button
                      type="button"
                      id="copy-upi-btn"
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Pay Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Output Footer */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Compatible with all Indian banks</span>
              <span className="text-blue-600 font-medium">Instant Credit</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
