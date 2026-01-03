
import React, { useState, useEffect } from 'react';
import { Sparkles, X, BrainCircuit, Lightbulb, TrendingUp, Loader2, Users, Activity, HeartPulse, Speech, BarChart3, ChevronRight, Layers, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { analyzeStaffData, AnalysisResponse } from '../services/geminiService';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: any[];
}

const ROLE_META: Record<string, { label: string, icon: any, color: string, bg: string }> = {
  pt: { label: '理学療法士', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  ot: { label: '作業療法士', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  st: { label: '言語聴覚士', icon: Speech, color: 'text-orange-600', bg: 'bg-orange-50' }
};

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, staffList }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (staffList.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeStaffData(staffList);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError("分析中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      handleAnalyze();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center md:justify-end md:p-4">
      <div className="bg-white w-full md:max-w-xl h-full md:max-h-[95vh] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border border-slate-100">
        <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight leading-none">AI チーム・組織診断</h3>
              <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest mt-2 opacity-80">Rehaviz Intelligence Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar pb-40">
          {loading ? (
            <div className="text-center py-32 space-y-6">
              <Loader2 className="animate-spin text-indigo-600 mx-auto" size={48} />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">提供領域ごとのラダー構成を解析中...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-12">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <BrainCircuit className="absolute -right-4 -bottom-4 opacity-10 text-white" size={120} />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Executive Summary</p>
                <p className="text-base font-bold leading-relaxed relative z-10 text-indigo-50">{analysis.summary}</p>
              </div>

              {/* チーム（ドメイン）別インサイト */}
              <section className="space-y-6">
                <h5 className="flex items-center text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">
                  <MapPin className="mr-3 text-indigo-500" size={18} /> 提供領域別インサイト
                </h5>
                <div className="grid grid-cols-1 gap-6">
                  {analysis.domainInsights?.map((insight, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-4 py-1.5 bg-white shadow-sm border border-slate-200 rounded-xl text-xs font-black text-slate-900">{insight.domain} チーム</span>
                        <ShieldCheck size={18} className="text-indigo-600" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] leading-relaxed"><span className="text-emerald-600 font-black">強み:</span> <span className="text-slate-600 font-bold">{insight.strength}</span></p>
                        <p className="text-[11px] leading-relaxed"><span className="text-rose-500 font-black">リスク:</span> <span className="text-slate-600 font-bold">{insight.risk}</span></p>
                        <div className="pt-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">推奨ラダーバランス</p>
                          <p className="text-[11px] text-indigo-600 font-black">{insight.optimalLadderBalance}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ラダー×年数分布 */}
              <section className="space-y-6">
                <h5 className="flex items-center text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">
                  <BarChart3 className="mr-3 text-indigo-500" size={18} /> 経験 × ラダー成熟度
                </h5>
                <div className="space-y-4">
                  {analysis.domainDistribution.map((dist, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
                      <p className="text-xs font-black text-slate-900 mb-4 flex items-center">
                        <ChevronRight size={14} className="text-indigo-500 mr-1" /> {dist.stage}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {dist.domainBreakdown.map((db, i) => (
                          <div key={i} className="flex flex-col p-4 bg-slate-50 rounded-2xl">
                            <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{db.domain}</span>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-xl font-black text-indigo-600">{db.count}</span>
                              <span className="text-[10px] font-bold text-slate-400">名</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 mt-1">Avg Lv. {db.avgLadder}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button onClick={handleAnalyze} className="w-full h-18 bg-slate-900 text-white rounded-[2rem] text-sm font-black shadow-2xl flex items-center justify-center space-x-3 hover:bg-indigo-600 transition-all">
                <TrendingUp size={18} />
                <span>再分析を実行</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
