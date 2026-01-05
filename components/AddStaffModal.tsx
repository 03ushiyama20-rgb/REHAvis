
import React, { useState, useEffect } from 'react';
import { X, UserPlus, GraduationCap, Briefcase, Award, Save, School as SchoolIcon, Calendar, Trash2, History, Target, ShieldCheck, Activity, HeartPulse, Speech, PlusCircle, MessageSquare, Edit2, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (staff: any) => void;
  onUpdate?: (staff: any) => void;
  editStaff?: any;
}

const ROLES = [
  { id: 'pt', label: 'PT', fullLabel: '理学療法士', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'ot', label: 'OT', fullLabel: '作業療法士', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'st', label: 'ST', fullLabel: '言語聴覚士', icon: Speech, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const DOMAIN_OPTIONS = ["AB（回復期）", "C（地域包括ケア・療養）", "D（急性期・外来）", "E（急性期）", "F（訪問）"];

const SCHOOL_OPTIONS = [
  { label: "国立・公立大学", options: ["名古屋大学", "名古屋市立大学", "東京大学", "京都大学", "大阪大学", "九州大学", "北海道大学", "広島大学", "信州大学", "千葉大学", "筑波大学", "埼玉県立大学", "神奈川県立保健福祉大学", "大阪公立大学", "神戸大学"] },
  { label: "私立大学（中部・東海）", options: ["藤田医科大学", "日本福祉大学", "愛知淑徳大学", "中部大学", "星城大学", "豊橋創造大学", "名古屋学院大学", "愛知医療学院大学", "人間環境大学", "修文大学", "鈴鹿医療科学大学", "岐阜聖徳学園大学"] },
  { label: "私立大学（関東・関西）", options: ["順天堂大学", "北里大学", "国際医療福祉大学", "杏林大学", "帝京大学", "目白大学", "昭和大学", "東京工科大学", "京都橘大学", "兵庫医科大学", "関西医療大学", "藍野大学"] },
  { label: "専門学校・その他", options: ["リハビリテーション専門学校（4年制）", "リハビリテーション専門学校（3年制）", "その他（手入力）"] }
];

const GRAD_SCHOOL_OPTIONS = [
  { label: "主要大学院", options: ["名古屋大学大学院 医学系研究科", "名古屋市立大学大学院 看護学研究科", "藤田医科大学大学院 保健学研究科", "日本福祉大学大学院 保健学研究科", "東京大学大学院 医学系研究科", "京都大学大学院 医学研究科", "大阪大学大学院 医学系研究科", "神戸大学大学院 保健学研究科", "広島大学大学院 医系科学研究科", "信州大学大学院 総合医理工学研究科", "北里大学大学院 医療系研究科", "順天堂大学大学院 保健医療学研究科", "国際医療福祉大学大学院 医療福祉学研究科", "星城大学大学院 健康科学研究科", "その他（手入力）"] }
];

const CERT_CATEGORIES = [
  { 
    id: 'common', 
    label: '共通・チーム医療・指導', 
    items: [
      "3学会合同呼吸療法認定士", "心臓リハビリテーション指導士", "臨床実習指導者講習会修了", 
      "地域ケア推進リーダー", "介護予防推進リーダー", "介護支援専門員", 
      "福祉住環境コーディネーター2級", "認知症ケア専門士",
      "がんリハ研修修了", "終末期ケア専門士", "NST専門療法士", "ボバース基礎修了",
      "認知神経リハ", "糖尿病療養指導士", "福祉用具専門相談員", "ケアマネジャー",
      "公認心理師", "排泄リハ認定", "骨粗鬆症マネージャー", "サルコペニア・フレイル指導士"
    ] 
  },
  { 
    id: 'pt', 
    label: '理学療法士 専門・認定', 
    items: [
      "登録理学療法士", "認定PT(脳卒中)", "認定PT(運動器)", "認定PT(循環器)", 
      "認定PT(呼吸器)", "認定PT(神経系)", "認定PT(小児)", "認定PT(スポーツ)",
      "認定PT(代謝)", "認定PT(臨床教育)", "認定PT(管理・運営)",
      "専門PT(基礎)", "専門PT(神経系)", "専門PT(運動器)", "専門PT(内部障害)",
      "日本スポーツ協会公認AT"
    ] 
  },
  { 
    id: 'ot', 
    label: '作業療法士 専門・認定', 
    items: [
      "認定作業療法士", "専門OT(脳血管)", "専門OT(高次脳)", "専門OT(身体障害)",
      "専門OT(精神障害)", "専門OT(発達障害)", "専門OT(老年期)",
      "MTDLP修了", "シーティングコンサルタント", "AMPS認定評価者", "FIM講習会修了"
    ] 
  },
  { 
    id: 'st', 
    label: '言語聴覚士 専門・認定', 
    items: [
      "認定ST(摂食嚥下)", "認定ST(失語・高次脳)", "認定ST(聴覚障害)",
      "認定ST(言語発達障害)", "認定ST(発声発語障害)",
      "LSVT LOUD認定", "嚥下内視鏡(VE)研修修了", "ディサースリア認定"
    ] 
  }
];

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onAdd, onUpdate, editStaff }) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    role: 'pt',
    experienceYears: 1,
    clinicalLadder: '1',
    schoolName: '',
    hasMaster: false,
    masterSchool: '',
    hasDoctor: false,
    doctorSchool: '',
    otherSkills: '',
    isMidCareer: false,
    preExperienceYears: 0,
    experienceHistory: [
      { domains: [DOMAIN_OPTIONS[0]], startYear: 1, endYear: '現在' }
    ]
  });

  const [certList, setCertList] = useState<string[]>([]);

  useEffect(() => {
    if (editStaff && isOpen) {
      setFormData({
        lastName: editStaff.lastName || '',
        firstName: editStaff.firstName || '',
        role: editStaff.role || 'pt',
        experienceYears: editStaff.experienceYears || 1,
        clinicalLadder: editStaff.clinicalLadder || '1',
        schoolName: editStaff.schoolName || '',
        hasMaster: editStaff.hasMaster || false,
        masterSchool: editStaff.masterSchool || '',
        hasDoctor: editStaff.hasDoctor || false,
        doctorSchool: editStaff.doctorSchool || '',
        otherSkills: editStaff.otherSkills || '',
        isMidCareer: editStaff.isMidCareer || false,
        preExperienceYears: editStaff.preExperienceYears || 0,
        experienceHistory: editStaff.experienceHistory || [{ domains: [DOMAIN_OPTIONS[0]], startYear: 1, endYear: '現在' }]
      });
      setCertList(editStaff.certifications ? editStaff.certifications.split(',').map((c: string) => c.trim()) : []);
    } else if (isOpen) {
      setFormData({ 
        lastName: '', firstName: '', role: 'pt', experienceYears: 1, clinicalLadder: '1', schoolName: '', 
        hasMaster: false, masterSchool: '', hasDoctor: false, doctorSchool: '', otherSkills: '', 
        isMidCareer: false, preExperienceYears: 0,
        experienceHistory: [{ domains: [DOMAIN_OPTIONS[0]], startYear: 1, endYear: '現在' }]
      });
      setCertList([]);
    }
  }, [editStaff, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(prev => {
      const newHistory = [...prev.experienceHistory];
      if (newHistory.length > 0) {
        const lastIdx = newHistory.length - 1;
        newHistory[lastIdx] = { ...newHistory[lastIdx], endYear: '現在' };
        if (newHistory[lastIdx].startYear > prev.experienceYears) {
          newHistory[lastIdx].startYear = prev.experienceYears;
        }
      }
      return { ...prev, experienceHistory: newHistory };
    });
  }, [formData.experienceYears]);

  const addExpRow = () => {
    const history = [...formData.experienceHistory];
    const lastRow = history[history.length - 1];
    history[history.length - 1] = { 
      ...lastRow, 
      endYear: `${formData.experienceYears}年目` 
    };
    history.push({
      domains: [DOMAIN_OPTIONS[0]],
      startYear: formData.experienceYears,
      endYear: '現在'
    });
    setFormData({ ...formData, experienceHistory: history });
  };

  const removeExpRow = (index: number) => {
    let newHistory = formData.experienceHistory.filter((_, i) => i !== index);
    if (newHistory.length > 0) {
      newHistory[newHistory.length - 1].endYear = '現在';
    }
    setFormData({ ...formData, experienceHistory: newHistory });
  };

  const updateExpRowStart = (index: number, year: number) => {
    const newHistory = [...formData.experienceHistory];
    const minVal = index > 0 ? newHistory[index-1].startYear + 1 : 1;
    const safeYear = Math.max(minVal, Math.min(formData.experienceYears, year));
    newHistory[index].startYear = safeYear;
    if (index > 0) {
      const prevEndVal = safeYear - 1;
      newHistory[index - 1].endYear = prevEndVal >= 1 ? `${prevEndVal}年目` : `1年目`;
    }
    setFormData({ ...formData, experienceHistory: newHistory });
  };

  const updateExpRowDomain = (index: number, domain: string) => {
    const newHistory = [...formData.experienceHistory];
    newHistory[index].domains = [domain];
    setFormData({ ...formData, experienceHistory: newHistory });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staffData = {
      ...formData,
      id: editStaff?.id || Math.random().toString(36).substr(2, 9),
      certifications: certList.join(', '),
    };
    if (editStaff && onUpdate) onUpdate(staffData);
    else onAdd(staffData);
    onClose();
  };

  const toggleCert = (cert: string) => {
    setCertList(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[120] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
      <div className="bg-white w-full md:max-w-7xl h-[94vh] md:h-auto md:max-h-[95vh] rounded-t-[3rem] md:rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0 border-b border-slate-50">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg">
                {editStaff ? <Edit2 size={24} /> : <UserPlus size={24} />}
              </div>
              <div>
                <h2 className="font-black text-xl text-slate-900 tracking-tight">{editStaff ? 'スタッフ情報を編集' : '新規スタッフ登録'}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Professional Personnel Entry</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl md:hidden"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar pb-32">
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-indigo-600 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">基本情報</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">苗字</label>
                   <input required placeholder="姓" className="h-16 px-6 bg-slate-50 border-none rounded-2xl text-lg font-black shadow-inner w-full focus:ring-2 focus:ring-indigo-500" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">名前</label>
                   <input required placeholder="名" className="h-16 px-6 bg-slate-50 border-none rounded-2xl text-lg font-black shadow-inner w-full focus:ring-2 focus:ring-indigo-500" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">職種と臨床経験</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex p-1.5 bg-slate-100 rounded-[2rem] gap-2">
                  {ROLES.map(r => (
                    <button key={r.id} type="button" onClick={() => setFormData({ ...formData, role: r.id })} className={`flex-1 flex flex-col items-center justify-center py-4 rounded-[1.5rem] transition-all gap-2 ${formData.role === r.id ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400'}`}>
                      <r.icon size={20} className={formData.role === r.id ? r.color : 'text-slate-300'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex p-1.5 bg-slate-100 rounded-[2rem] gap-2">
                  <button type="button" onClick={() => setFormData({ ...formData, isMidCareer: false })} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest ${!formData.isMidCareer ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400'}`}>新卒入職</button>
                  <button type="button" onClick={() => setFormData({ ...formData, isMidCareer: true })} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest ${formData.isMidCareer ? 'bg-white shadow-xl text-amber-600' : 'text-slate-400'}`}>中途採用</button>
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={14} /> 合計臨床経験</label>
                  <div className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xl font-black shadow-lg">{formData.experienceYears}年目</div>
                </div>
                <input type="range" min="1" max="40" className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" value={formData.experienceYears} onChange={e => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, experienceYears: val, clinicalLadder: String(Math.min(4, Math.floor(val / 3) + 1)) });
                }} />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-5 bg-purple-600 rounded-full"></div>
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">配属履歴・期間</h3>
                </div>
                <button type="button" onClick={addExpRow} className="flex items-center space-x-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-all">
                   <PlusCircle size={14} /> <span>職歴を追加</span>
                </button>
              </div>
              <div className="space-y-4">
                {formData.experienceHistory.map((row, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === formData.experienceHistory.length - 1;
                  return (
                    <div key={idx} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 flex flex-col md:flex-row items-center gap-6 group shadow-sm hover:border-indigo-100 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-lg">{idx + 1}</div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">配属領域（チーム）</span>
                          <select className="h-14 px-5 bg-slate-50 border-none rounded-2xl text-xs font-bold w-full shadow-inner focus:ring-2 focus:ring-indigo-500" value={row.domains[0]} onChange={e => updateExpRowDomain(idx, e.target.value)}>
                            {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">開始年調整</span>
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                               {row.startYear}年目 <ArrowRight size={10} /> {row.endYear === '現在' ? `現在` : row.endYear}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="1" 
                              max={formData.experienceYears} 
                              disabled={isFirst} 
                              className={`flex-1 h-2 rounded-full appearance-none cursor-pointer accent-indigo-600 ${isFirst ? 'opacity-30 cursor-not-allowed' : 'bg-slate-100'}`} 
                              value={row.startYear} 
                              onChange={e => updateExpRowStart(idx, parseInt(e.target.value))} 
                            />
                            {formData.experienceHistory.length > 1 && !isLast && (
                              <button type="button" onClick={() => removeExpRow(idx)} className="p-3 text-slate-300 hover:text-rose-500 transition-all bg-slate-50 rounded-xl hover:bg-rose-50"><Trash2 size={18} /></button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-amber-500 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">習熟度 (Clinical Ladder)</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(level => (
                  <button key={level} type="button" onClick={() => setFormData({ ...formData, clinicalLadder: String(level) })} className={`py-4 rounded-2xl border-2 transition-all ${formData.clinicalLadder === String(level) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Level {level}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-slate-900 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">学歴・養成校</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">卒業校（学士・専門課程）</label>
                  <select className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl font-black shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500" value={formData.schoolName} onChange={e => setFormData({ ...formData, schoolName: e.target.value })}>
                    <option value="">出身養成校を選択</option>
                    {SCHOOL_OPTIONS.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${formData.hasMaster ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/10' : 'bg-white border-slate-100'}`}>
                    <button type="button" onClick={() => setFormData({ ...formData, hasMaster: !formData.hasMaster })} className="flex items-center space-x-3 w-full">
                      <div className={`p-2 rounded-lg ${formData.hasMaster ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><GraduationCap size={20} /></div>
                      <span className={`text-xs font-black uppercase tracking-widest ${formData.hasMaster ? 'text-indigo-900' : 'text-slate-400'}`}>修士課程 修了</span>
                    </button>
                    {formData.hasMaster && (
                      <select className="w-full h-12 px-4 bg-white border-none rounded-xl text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 animate-in fade-in slide-in-from-top-1" value={formData.masterSchool} onChange={e => setFormData({ ...formData, masterSchool: e.target.value })}>
                        <option value="">大学院名を選択</option>
                        {GRAD_SCHOOL_OPTIONS.map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${formData.hasDoctor ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-600/10' : 'bg-white border-slate-100'}`}>
                    <button type="button" onClick={() => setFormData({ ...formData, hasDoctor: !formData.hasDoctor })} className="flex items-center space-x-3 w-full">
                      <div className={`p-2 rounded-lg ${formData.hasDoctor ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}><ShieldCheck size={20} /></div>
                      <span className={`text-xs font-black uppercase tracking-widest ${formData.hasDoctor ? 'text-purple-900' : 'text-slate-400'}`}>博士課程 修了</span>
                    </button>
                    {formData.hasDoctor && (
                      <select className="w-full h-12 px-4 bg-white border-none rounded-xl text-xs font-bold shadow-sm focus:ring-2 focus:ring-purple-500 animate-in fade-in slide-in-from-top-1" value={formData.doctorSchool} onChange={e => setFormData({ ...formData, doctorSchool: e.target.value })}>
                        <option value="">大学院名を選択</option>
                        {GRAD_SCHOOL_OPTIONS.map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">専門・認定資格（網羅版）</h3>
              </div>
              <div className="space-y-8">
                {CERT_CATEGORIES.filter(cat => cat.id === 'common' || cat.id === formData.role).map(cat => (
                  <div key={cat.id} className="space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Award size={12} className="text-amber-500" /> {cat.label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {cat.items.map(cert => (
                        <button 
                          key={cert} 
                          type="button" 
                          onClick={() => toggleCert(cert)} 
                          className={`px-3 py-3 rounded-xl text-[9px] font-bold transition-all border-2 flex items-center justify-center text-center leading-tight h-14 ${certList.includes(cert) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-50 text-slate-400 hover:border-emerald-100'}`}
                        >
                          {cert}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-slate-400 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">ポートフォリオ・実績</h3>
              </div>
              <textarea 
                className="w-full h-40 p-6 bg-slate-50 border-none rounded-[2.5rem] text-sm font-medium shadow-inner focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                placeholder="研究発表、学会活動、院内委員会、外部講師の実績など..."
                value={formData.otherSkills}
                onChange={e => setFormData({ ...formData, otherSkills: e.target.value })}
              />
            </section>
          </form>

          <div className="p-8 bg-white border-t border-slate-50 flex items-center gap-6 shadow-2xl shrink-0">
            <button type="button" onClick={onClose} className="flex-1 h-18 bg-slate-100 text-slate-600 rounded-[2.5rem] font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-200">キャンセル</button>
            <button onClick={handleSubmit} className="flex-[2] h-18 bg-slate-900 text-white rounded-[2.5rem] font-black flex items-center justify-center space-x-3 shadow-2xl hover:bg-indigo-600 transition-all uppercase text-sm tracking-widest">
              <Save size={20} /> <span>{editStaff ? '情報を更新' : 'スタッフを登録'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
