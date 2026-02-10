"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Shield, Search, Filter, MapPin, Clock, 
  CheckCircle, AlertCircle, Loader2, FileText, 
  Video, Image as ImageIcon, X, LogOut 
} from 'lucide-react';

// --- CONFIGURATION ---
// PASTE YOUR CLOUDFLARE PUBLIC DOMAIN HERE (from Step 2)
// Example: "https://pub-123456.r2.dev"
const R2_DOMAIN = "https://pub-0db38d8baafd46f29541edddf7c8f975.r2.dev"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Stats
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    active: reports.filter(r => r.status === 'investigating').length,
    closed: reports.filter(r => r.status === 'closed').length,
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/police-login'); return; }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setReports(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedReport?.id === id) setSelectedReport({ ...selectedReport, status: newStatus });

    await supabase.from('reports').update({ status: newStatus }).eq('id', id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/police-login');
  };

  // Filter Logic
  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm tracking-widest uppercase">Accessing Secure Database...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="font-bold text-lg tracking-wide">GH-INTEL</h1>
            <p className="text-xs text-slate-500">Command Center</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button onClick={() => setFilter('all')} className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${filter === 'all' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <span className="text-sm font-medium">All Reports</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{stats.total}</span>
          </button>
          <button onClick={() => setFilter('pending')} className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${filter === 'pending' ? 'bg-yellow-600/50 text-yellow-200' : 'hover:bg-slate-800'}`}>
            <span className="text-sm font-medium">Pending Review</span>
            <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{stats.pending}</span>
          </button>
          <button onClick={() => setFilter('investigating')} className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${filter === 'investigating' ? 'bg-blue-900/50 text-blue-200' : 'hover:bg-slate-800'}`}>
            <span className="text-sm font-medium">Active Cases</span>
            <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{stats.active}</span>
          </button>
          <button onClick={() => setFilter('closed')} className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${filter === 'closed' ? 'bg-green-900/50 text-green-200' : 'hover:bg-slate-800'}`}>
            <span className="text-sm font-medium">Closed / Solved</span>
            <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{stats.closed}</span>
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        
        {/* Header Stats */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Intelligence Feed</h2>
            <p className="text-slate-500 text-sm">Real-time civilian reporting stream</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-400 uppercase">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-bold text-green-700">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Report List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Type / Category</th>
                <th className="p-4 border-b">Location</th>
                <th className="p-4 border-b">Evidence</th>
                <th className="p-4 border-b">Time</th>
                <th className="p-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-700 capitalize">{report.report_type}</div>
                    <div className="text-xs text-slate-500 capitalize">{report.category}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {report.location}
                    </div>
                  </td>
                  <td className="p-4">
                    {report.media_urls && report.media_urls.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        <ImageIcon className="w-3 h-3" /> {report.media_urls.length} Files
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(report.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
             <div className="p-12 text-center text-slate-400">No reports found in this category.</div>
          )}
        </div>
      </main>

      {/* MODAL - REPORT DETAILS */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <h2 className="text-xl font-bold text-slate-900">Case #{selectedReport.id.slice(0, 8)}</h2>
                   <StatusBadge status={selectedReport.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                   <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(selectedReport.created_at).toLocaleString()}</span>
                   <span className="flex items-center gap-1"><Shield className="w-4 h-4"/> IP: {selectedReport.ip_address}</span>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-white flex-1">
              
              <div className="grid grid-cols-3 gap-8">
                {/* Left: Details */}
                <div className="col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Location</h3>
                    <div className="p-3 bg-slate-50 rounded-lg text-slate-800 font-medium flex gap-2">
                       <MapPin className="w-5 h-5 text-red-500" /> {selectedReport.location}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Intelligence Report</h3>
                    <div className="p-4 bg-slate-50 rounded-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                       {selectedReport.description}
                    </div>
                  </div>
                  
                  {/* Media Gallery */}
                  <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Evidence Vault</h3>
                     <div className="grid grid-cols-3 gap-2">
                       {selectedReport.media_urls?.map((key: string, idx: number) => {
                         // Check if it's a video based on extension
                         const isVideo = key.match(/\.(mp4|mov|webm)$/i);
                         const fileUrl = `${R2_DOMAIN}/${key}`;

                         return (
                           <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video">
                             {isVideo ? (
                               <video controls src={fileUrl} className="w-full h-full object-cover" />
                             ) : (
                               <a href={fileUrl} target="_blank" rel="noreferrer">
                                 <img src={fileUrl} className="w-full h-full object-cover hover:opacity-90 transition-opacity" alt="Evidence" />
                               </a>
                             )}
                           </div>
                         );
                       })}
                       {(!selectedReport.media_urls || selectedReport.media_urls.length === 0) && (
                         <div className="col-span-3 text-sm text-slate-400 italic">No media evidence attached.</div>
                       )}
                     </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="col-span-1 space-y-6">
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 uppercase mb-4">Case Action</h3>
                      
                      <div className="space-y-2">
                        <button 
                          onClick={() => updateStatus(selectedReport.id, 'investigating')}
                          className={`w-full py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-between ${selectedReport.status === 'investigating' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-500'}`}
                        >
                          Mark Investigating <Search className="w-4 h-4" />
                        </button>
                        <button 
                           onClick={() => updateStatus(selectedReport.id, 'closed')}
                           className={`w-full py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-between ${selectedReport.status === 'closed' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-500'}`}
                        >
                          Mark Resolved <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                           onClick={() => updateStatus(selectedReport.id, 'pending')}
                           className={`w-full py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-between ${selectedReport.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-yellow-500'}`}
                        >
                          Mark Pending <Clock className="w-4 h-4" />
                        </button>
                      </div>
                   </div>

                   <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                     <h3 className="text-xs font-bold text-red-900 uppercase mb-2">High Risk Alert</h3>
                     <p className="text-xs text-red-800 leading-snug">
                       If this report contains imminent threats to life, escalate immediately via standard radio protocols.
                     </p>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    investigating: "bg-blue-100 text-blue-800 border-blue-200",
    closed: "bg-green-100 text-green-800 border-green-200",
  };
  const labels = {
    pending: "Pending Review",
    investigating: "Under Investigation",
    closed: "Case Closed",
  };
  // @ts-ignore
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>{labels[status] || status}</span>
}