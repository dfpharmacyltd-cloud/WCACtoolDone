import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Scan,
  RefreshCw,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Zap,
  Info,
  Layers,
  StopCircle,
} from 'lucide-react';
import { SAMPLE_INVOICES, SampleInvoice } from '../data/sampleInvoices';
import { scanInvoiceWithAI } from '../utils/ocrService';
import { ScanInvoiceResult, User } from '../types';

interface ScannerViewProps {
  currentUser: User;
  onScanCompleted: (result: ScanInvoiceResult, previewImage: string, fileName: string) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ currentUser, onScanCompleted }) => {
  const [selectedFile, setSelectedFile] = useState<{
    dataUrl: string;
    name: string;
    mimeType: string;
  } | null>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [useLocalOcrOnly, setUseLocalOcrOnly] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto load camera device list if available
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setCameraDevices(videoInputs);
        if (videoInputs.length > 0) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      });
    }

    return () => {
      stopCamera();
    };
  }, []);

  // Stop camera helper
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start Live Mobile/Web Camera
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (mediaStreamRef.current) {
        stopCamera();
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'environment' },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setErrorMsg('Camera access was denied or not available. Please allow camera permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  // Capture Snapshot from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setSelectedFile({
      dataUrl,
      name: `Camera_Capture_${Date.now()}.jpg`,
      mimeType: 'image/jpeg',
    });

    stopCamera();
  };

  // File Upload Handlers (JPG, PNG, PDF)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  const processUploadedFile = (file: File) => {
    setErrorMsg(null);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setSelectedFile({
        dataUrl: result,
        name: file.name,
        mimeType: file.type || 'image/jpeg',
      });
      stopCamera();
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read selected file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  // Select Sample Pharma Invoice
  const handleSelectSample = (sample: SampleInvoice) => {
    stopCamera();
    setSelectedFile({
      dataUrl: sample.dataUrl,
      name: `${sample.invoiceNo}_${sample.vendorName.replace(/\s+/g, '_')}.svg`,
      mimeType: 'image/svg+xml',
    });
    setErrorMsg(null);
  };

  // Run AI Extraction
  const handleScanAndExtract = async () => {
    if (!selectedFile) {
      setErrorMsg('Please capture an invoice photo or upload an invoice document first.');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);

    try {
      setScanStepMessage('Analyzing invoice document layout & visual structure...');
      await new Promise((r) => setTimeout(r, 400));

      setScanStepMessage('Extracting Supplier Name, GSTIN, Invoice Number & Date...');
      await new Promise((r) => setTimeout(r, 400));

      setScanStepMessage('Matching with Vendor Master Intelligence to auto-assign Department...');

      const result = await scanInvoiceWithAI(selectedFile.dataUrl, selectedFile.mimeType, useLocalOcrOnly);

      setScanStepMessage('Extraction complete! Redirecting to verification review...');
      await new Promise((r) => setTimeout(r, 300));

      onScanCompleted(result, selectedFile.dataUrl, selectedFile.name);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'AI document analysis failed. Please verify the document is legible.');
    } finally {
      setIsScanning(false);
      setScanStepMessage('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                Optical Document Intelligence
              </span>
              <span className="text-xs text-slate-500 font-medium">No Paid APIs Required</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Pharma Tax Invoice Scanner &amp; Reader
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Supports live camera capture, scanned PDFs, JPG, and PNG purchase bills.
            </p>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 self-start sm:self-center">
            <span className="text-xs font-semibold text-slate-600">Engine:</span>
            <button
              onClick={() => setUseLocalOcrOnly(false)}
              className={`text-xs font-medium px-2.5 py-1 rounded transition ${
                !useLocalOcrOnly ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Gemini Vision (Primary)
            </button>
            <button
              onClick={() => setUseLocalOcrOnly(true)}
              className={`text-xs font-medium px-2.5 py-1 rounded transition ${
                useLocalOcrOnly ? 'bg-teal-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Local OCR (Fallback)
            </button>
          </div>
        </div>
      </div>

      {/* Main 3 Action Buttons per prompt: 📷 Capture Invoice, 📄 Upload PDF, 🔍 Scan & Extract */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Capture Invoice Button */}
        <button
          id="btn-capture-invoice"
          onClick={startCamera}
          disabled={isScanning}
          className={`flex items-center justify-center space-x-3 p-4 rounded-xl border font-semibold text-sm transition shadow-xs ${
            isCameraActive
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-white border-slate-300 hover:border-teal-500 text-slate-800 hover:bg-teal-50/40'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-900">📷 Capture Invoice</div>
            <div className="text-xs text-slate-500 font-normal">Use mobile or webcam camera</div>
          </div>
        </button>

        {/* 2. Upload PDF / Image Button */}
        <button
          id="btn-upload-pdf"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex items-center justify-center space-x-3 p-4 rounded-xl border border-slate-300 bg-white hover:border-teal-500 text-slate-800 hover:bg-teal-50/40 font-semibold text-sm transition shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-900">📄 Upload PDF / Image</div>
            <div className="text-xs text-slate-500 font-normal">Supports Scanner PDF, JPG, PNG</div>
          </div>
        </button>

        {/* 3. Scan & Extract Button */}
        <button
          id="btn-scan-and-extract"
          onClick={handleScanAndExtract}
          disabled={isScanning || !selectedFile}
          className={`flex items-center justify-center space-x-3 p-4 rounded-xl font-bold text-sm transition shadow-sm ${
            selectedFile && !isScanning
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedFile ? 'bg-teal-800 text-white' : 'bg-slate-300 text-slate-500'}`}>
            <Scan className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold">🔍 Scan &amp; Extract</div>
            <div className="text-xs opacity-80 font-normal">
              {isScanning ? 'Processing...' : selectedFile ? 'Ready to parse invoice' : 'Select or capture invoice first'}
            </div>
          </div>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Camera View Area */}
      {isCameraActive && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-semibold text-sm">Live Camera Scanner</span>
            </div>

            {cameraDevices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  setTimeout(startCamera, 100);
                }}
                className="bg-slate-800 text-xs text-white border border-slate-700 rounded px-2 py-1"
              >
                {cameraDevices.map((dev, idx) => (
                  <option key={dev.deviceId} value={dev.deviceId}>
                    {dev.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={stopCamera}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <StopCircle className="w-4 h-4 text-rose-400" />
              <span>Close Camera</span>
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3 max-h-[480px] mx-auto border-2 border-dashed border-teal-500/60 flex items-center justify-center">
            <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-contain" />
            
            {/* Guide overlay box for aligning tax invoice */}
            <div className="absolute inset-8 border-2 border-teal-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-4">
              <div className="text-[11px] font-mono font-semibold bg-slate-900/80 text-teal-300 self-start px-2 py-0.5 rounded">
                Align Tax Invoice Header &amp; GSTIN within frame
              </div>
              <div className="flex justify-between text-[10px] text-teal-400/70 font-mono">
                <span>[ TOP LEFT ]</span>
                <span>[ BOTTOM RIGHT ]</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              id="btn-take-photo"
              onClick={capturePhoto}
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo &amp; Use</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dropzone / Preview & Sample Invoice Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Active Selected Preview (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Document Workspace</h2>
            {selectedFile && (
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[200px]">
                {selectedFile.name}
              </span>
            )}
          </div>

          {/* Interactive File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center min-h-[360px] ${
              selectedFile
                ? 'border-teal-500 bg-teal-50/10'
                : 'border-slate-300 hover:border-teal-500 bg-slate-50/50 cursor-pointer'
            }`}
          >
            {selectedFile ? (
              <div className="w-full space-y-4">
                <div className="relative max-h-[460px] overflow-auto border border-slate-200 rounded-lg p-2 bg-white flex items-center justify-center shadow-inner">
                  {selectedFile.mimeType.includes('pdf') ? (
                    <div className="p-8 text-center space-y-3">
                      <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                      <div className="font-bold text-slate-800 text-sm">{selectedFile.name}</div>
                      <div className="text-xs text-slate-500">Scanned PDF Document ready for Vision extraction</div>
                    </div>
                  ) : (
                    <img
                      src={selectedFile.dataUrl}
                      alt="Invoice Document Preview"
                      className="max-h-[420px] max-w-full object-contain rounded"
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Loaded: <strong className="font-mono text-slate-900">{selectedFile.name}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-600 hover:text-slate-900 font-semibold underline px-2"
                    >
                      Change Document
                    </button>
                    <button
                      onClick={handleScanAndExtract}
                      disabled={isScanning}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-1.5 rounded-lg shadow-xs flex items-center space-x-1.5"
                    >
                      <Scan className="w-4 h-4" />
                      <span>Extract Details Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-14 h-14 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Drag and drop your Tax Invoice here, or <span className="text-teal-600 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-resolution camera photos, Scanner PDFs, JPG, and PNG files
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 pt-2">
                  <span className="text-[11px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">PDF</span>
                  <span className="text-[11px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">JPG</span>
                  <span className="text-[11px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">PNG</span>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Extraction Status Banner */}
          {isScanning && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-teal-700 animate-spin" />
                <span className="font-bold text-xs uppercase tracking-wide">Processing Document with AI Vision</span>
              </div>
              <p className="text-xs text-teal-800 font-medium pl-6">{scanStepMessage}</p>
              <div className="w-full bg-teal-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 1-Click Pre-loaded Pharma Sample Invoices (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant 1-Click Testing</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Sample Pharma Invoices</h2>
            <p className="text-xs text-slate-500">
              Select any pre-configured purchase bill to test automatic vendor matching &amp; extraction instantly.
            </p>
          </div>

          <div className="space-y-3">
            {SAMPLE_INVOICES.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 cursor-pointer transition text-left space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono border border-slate-200">
                    Dept: {sample.department}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    ₹ {sample.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate">{sample.vendorName}</div>
                <div className="text-[11px] text-slate-500 leading-snug line-clamp-2">{sample.description}</div>
                <div className="text-[10px] text-teal-700 font-semibold pt-1 flex items-center space-x-1">
                  <span>Bill #{sample.invoiceNo}</span>
                  <span>• Click to load</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Guidance Box */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>Vendor Intelligence Rule:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              When <strong>ABC Chemicals</strong> is detected, AI automatically classifies it to <strong>RM (Raw Material)</strong>.
              When <strong>XYZ Packaging</strong> is detected, it is classified to <strong>PM (Packaging Material)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
