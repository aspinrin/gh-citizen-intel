"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, MapPin, AlertTriangle, Shield, CheckCircle, Lock, Image as ImageIcon, Video as VideoIcon, X, Trash2 } from 'lucide-react';

export default function CitizenPortal() {
  const [reportType, setReportType] = useState('tip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const AGENCY_NAME = process.env.NEXT_PUBLIC_AGENCY_NAME || "Police Service";
  const COUNTRY_NAME = process.env.NEXT_PUBLIC_COUNTRY_NAME || "Ghana";
  const TWITTER_LINK = process.env.NEXT_PUBLIC_TWITTER_LINK || "#";
  const FB_LINK = process.env.NEXT_PUBLIC_FACEBOOK_LINK || "#";
  
  // Separate State for Images and Videos
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: '',
    location: '',
    details: '',
  });

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // --- Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImageFiles([...imageFiles, ...newFiles]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setVideoFiles([...videoFiles, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeVideo = (index: number) => {
    const newFiles = [...videoFiles];
    newFiles.splice(index, 1);
    setVideoFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadStatus('Initializing secure connection...');

    try {
      const uploadedKeys: string[] = [];
      const allFiles = [...imageFiles, ...videoFiles];

      // 1. Upload Files
      if (allFiles.length > 0) {
        for (const file of allFiles) {
          setUploadStatus(`Encrypting & Uploading: ${file.name}...`);
          const uploadRes = await fetch('/api/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, fileType: file.type }),
          });

          if (!uploadRes.ok) throw new Error('Upload handshake failed');
          const { url, key } = await uploadRes.json();

          await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          uploadedKeys.push(key);
        }
      }

      setUploadStatus('Finalizing report...');

      // 2. Submit Data
      const response = await fetch('/api/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          ...formData,
          mediaUrls: uploadedKeys,
        }),
      });

      if (!response.ok) throw new Error('Failed to save report');

      setSubmitted(true);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Submission Received</h2>
          <p className="text-slate-400 mb-6">
            Your information has been securely encrypted and sent to the Intelligence Unit. 
            Thank you for helping keep Ghana safe.
          </p>
          
          {/* RESTORED: Social Links */}
          <div className="border-t border-slate-700 pt-6">
            <p className="text-sm text-slate-500 mb-4">Follow updates on verified operations:</p>
            <div className="flex justify-center gap-4">
               <a 
                 href={FB_LINK}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
               >
                 Facebook
               </a>
               <a 
                 href={TWITTER_LINK}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="px-4 py-2 bg-black border border-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
               >
                 X (Twitter)
               </a>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="mt-6 text-slate-500 hover:text-white text-xs underline"
            >
                Submit another report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg border-b border-yellow-500">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-yellow-500" />
            <span className="font-bold tracking-wider">{COUNTRY_NAME}-INTEL</span>
          </div>
          {/* RESTORED: Anonymous Label */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Encrypted & Anonymous</span>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Citizen Intelligence Portal</h1>
          <p className="text-slate-600 mb-4">Securely submit evidence to law enforcement.</p>
          
          {/* RESTORED: Privacy Notice */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg inline-flex gap-2 items-center text-left mx-auto max-w-lg">
            <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800">
              <span className="font-bold">Privacy Notice:</span> We do not ask for your email, phone number, or name. 
              We only log device technical data (IP) to prevent spam and abuse.
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-slate-200 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setReportType('tip')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              reportType === 'tip' ? 'bg-white shadow-sm text-blue-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            I have a Tip
          </button>
          <button 
            onClick={() => setReportType('report')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              reportType === 'report' ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Report a Crime
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="robbery">Robbery / Theft</option>
                  <option value="drugs">Drugs</option>
                  <option value="scam">Fraud / Scammers</option>
                  <option value="assault">Assault</option>
                  <option value="corruption">Corruption</option>
                  <option value="traffic">Traffic Offense</option>
                  <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="text" required placeholder="e.g. Ho Market" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea required rows={4} placeholder="Describe details..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none resize-none focus:border-blue-500"
              onChange={(e) => setFormData({...formData, details: e.target.value})}></textarea>
          </div>

          {/* Upload Section */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:bg-slate-50 rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center h-32 transition-colors"
            >
                <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                <ImageIcon className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-slate-600">Add Photos</span>
            </div>

            <div 
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:bg-slate-50 rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center h-32 transition-colors"
            >
                <input ref={videoInputRef} type="file" multiple accept="video/*" onChange={handleVideoChange} className="hidden" />
                <VideoIcon className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-sm font-medium text-slate-600">Add Video</span>
            </div>
          </div>

          {(imageFiles.length > 0 || videoFiles.length > 0) && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Selected Evidence</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                    {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative w-20 h-20 group">
                            <img src={src} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-300" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    {videoFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-sm">
                            <div className="flex items-center gap-2 truncate">
                                <VideoIcon className="w-4 h-4 text-red-500 shrink-0" />
                                <span className="truncate max-w-[150px] text-slate-700">{file.name}</span>
                            </div>
                            <button type="button" onClick={() => removeVideo(idx)} className="text-slate-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{uploadStatus}</span>
                </>
            ) : 'Submit Securely'}
          </button>
        </form>
      </main>
    </div>
  );
}