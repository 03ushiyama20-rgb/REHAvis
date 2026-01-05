
import React from 'react';
import { X, FileText, History, Award, Target, Trophy, School, Printer, ChevronRight, GraduationCap, Calendar, Trash2, Edit2, MessageSquare } from 'lucide-react';

interface StaffReportModalProps {
  staff: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const StaffReportModal: React.FC<StaffReportModalProps> = ({ staff, isOpen, onClose, onDelete }) => {
  if (!isOpen || !staff) return null;

  const handlePrint = () => { window.print(); };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[110] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden print:bg-white print:static">
      <div className="bg-white w-full md:max-w-5xl h-[94vh] md:h-auto md:max-h-[90vh] rounded-t-[3.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-full md:zoom-in-95 duration-500 print:shadow-none print:w-full">
        
        <div className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center space-x-3 text-slate-400">
            <FileText size={20} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Clinical Portfolio</span>
          </div>
          <div className="flex items-center space-x-3">
            {onDelete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(staff.id);
                }} 
                className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                title="スタッフを削除"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center space-x-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all"><Printer size={16} /> <span className="hidden sm:inline uppercase">Print Report</span></button>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 md:px-16 py-6 md:py-12 space-y-12 no-scrollbar print:p-10 pb-20">
          {/* Main Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-b-2 border-slate-50 pb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">{staff.role.toUpperCase()}</span>
                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Clinical Ladder Level {staff.clinicalLadder}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">{staff.lastName} {staff.firstName}</h1>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-center space-x-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                  <School size={16} className="text-indigo-500" />
                  <span className="text-sm font-black text-slate-700">{staff.schoolName} 出身</span>
                </div>
                <div className="flex items-center space-x-3 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
                  <Award size={16} className="text-indigo-700" />
                  <span className="text-sm font-black text-indigo-700">臨床経験 {staff.experienceYears}年目</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
            {/* 年次履歴 */}
            <div className="lg:col-span-5 space-y-10">
              <h3 className="font-black text-slate-900 flex items-center space-x-4 text-2xl tracking-tight"><History className="text-indigo-600" size={26} /> <span>臨床キャリアパス</span></h3>
              <div className="relative pl-10 border-l-4 border-slate-100 ml-5 space-y-12 py-4">
                {(staff.experienceHistory || []).map((h: any, i: number) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[58px] top-1 w-10 h-10 rounded-full border-8 border-white bg-indigo-600 shadow-xl group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{h.startYear}年目 ~ {h.endYear}</p>
                    <div className="flex flex-wrap gap-2">
                      {h.domains.map((d: string) => <span key={d} className="px-5 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-700 shadow-sm">{d}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 学位と資格 */}
            <div className="lg:col-span-7 space-y-12">
              <section className="space-y-8">
                <h3 className="font-black text-slate-900 flex items-center space-x-4 text-2xl tracking-tight"><GraduationCap className="text-indigo-600" size={26} /> <span>高等教育・学位</span></h3>
                <div className="grid grid-cols-1 gap-4">
                  {(staff.hasMaster || staff.hasDoctor) ? (
                    <>
                      {staff.hasMaster && (
                        <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl flex items-start space-x-6 relative overflow-hidden group">
                          <div className="bg-white/10 p-4 rounded-2xl shrink-0"><GraduationCap size={28} className="text-indigo-400" /></div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Master's Degree</p>
                            <p className="text-xl font-black mt-2 tracking-tight">{staff.masterSchool || '修士課程 修了'}</p>
                          </div>
                        </div>
                      )}
                      {staff.hasDoctor && (
                        <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl flex items-start space-x-6 relative overflow-hidden group">
                          <div className="bg-white/10 p-4 rounded-2xl shrink-0"><Trophy size={28} className="text-yellow-400" /></div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Doctoral Degree</p>
                            <p className="text-xl font-black mt-2 tracking-tight">{staff.doctorSchool || '博士課程 修了'}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">学士・高度専門士課程</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="font-black text-slate-900 flex items-center space-x-4 text-2xl tracking-tight"><Award className="text-amber-500" size={26} /> <span>専門・認定資格</span></h3>
                <div className="flex flex-wrap gap-3">
                  {staff.certifications?.split(',').map((c: string, i: number) => (
                    <span key={i} className="px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-wide hover:border-indigo-200 transition-colors">{c.trim()}</span>
                  )) || <p className="text-xs font-black text-slate-300 italic">登録資格なし</p>}
                </div>
              </section>

              {/* 自由記載内容の表示 */}
              {staff.otherSkills && (
                <section className="space-y-6">
                  <h3 className="font-black text-slate-900 flex items-center space-x-4 text-2xl tracking-tight"><MessageSquare className="text-emerald-500" size={26} /> <span>その他の実績・特記事項</span></h3>
                  <div className="p-8 bg-emerald-50/50 border-2 border-emerald-100 rounded-[2.5rem] text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {staff.otherSkills}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReportModal;
