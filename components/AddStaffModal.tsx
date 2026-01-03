
import React, { useState, useEffect } from 'react';
import { X, UserPlus, GraduationCap, Briefcase, Award, Save, School as SchoolIcon, Calendar, Trash2, History, Target, ShieldCheck, Activity, HeartPulse, Speech, PlusCircle, MessageSquare, Edit2, CheckCircle2 } from 'lucide-react';

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
      "地域包括ケア推進リーダー", "介護予防推進リーダー", "介護支援専門員(ケアマネ)", 
      "福祉住環境コーディネーター2級", "福祉住環境コーディネーター1級", "認知症ケア専門士",
      "がんリハビリテーション研修修了", "終末期ケア専門士", "NST専門療法士", "ボバース概念（基礎講習会）修了",
      "認知神経リハビリテーション（マスター）"
    ] 
  },
  { 
    id: 'pt', 
    label: '理学療法士 専門・認定', 
    items: [
      "登録理学療法士", "認定PT(脳卒中)", "認定PT(運動器)", "認定PT(循環器)", "認定PT(呼吸器)", 
      "認定PT(神経筋)", "認定PT(スポーツ)", "認定PT(小児)", "認定PT(代謝)", "認定PT(ウィメンズヘルス)", 
      "専門PT(基礎)", "専門PT(神経)", "専門PT(運動器)", "専門PT(内部障害)", "専門PT(生活環境支援)",
      "日本スポーツ協会公認AT", "SJF（関節ファシリテーション）技能者"
    ] 
  },
  { 
    id: 'ot', 
    label: '作業療法士 専門・認定', 
    items: [
      "認定作業療法士", "専門OT(脳血管障害)", "専門OT(高次脳機能障害)", "専門OT(身体障害)", 
      "専門OT(精神障害)", "専門OT(発達障害)", "専門OT(特別支援教育)", "AMPS認定評価者", 
      "MTDLP(生活行為向上マネジメント)修了", "シーティング・コンサルタント", "手外科（ハンドセラピスト）認定",
      "福祉用具プランナー", "感覚統合（SI）認定", "高次脳機能障害支援コーディネーター"
    ] 
  },
  { 
    id: 'st', 
    label: '言語聴覚士 専門・認定', 
    items: [
      "認定ST(摂食・嚥下障害)", "認定ST(失語・高次脳機能障害)", "認定ST(言語発達障害)", 
      "認定ST(聴覚障害)", "認定ST(成人発声発語障害)", "日本摂食嚥下リハビリテーション学会認定士", 
      "LSVT LOUD認定", "嚥下内視鏡検査(VE)研修修了", "認知症コミュニケーション等習得研修修了",
      "小児摂食嚥下（研修会）修了", "構音障害支援アドバイザー"
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

  const addExpRow = () => {
    setFormData({
      ...formData,
      experienceHistory: [...formData.experienceHistory, { domains: [DOMAIN_OPTIONS[0]], startYear: 1, endYear: '現在' }]
    });
  };

  const removeExpRow = (index: number) => {
    setFormData({
      ...formData,
      experienceHistory: formData.experienceHistory.filter((_, i) => i !== index)
    });
  };

  const updateExpRow = (index: number, field: string, value: any) => {
    const newHistory = [...formData.experienceHistory];
    newHistory[index] = { ...newHistory[index], [field]: value };
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
            
            {/* 基本情報 */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-indigo-600 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">基本・識別情報</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">苗字</label>
                  <input required placeholder="例: 佐藤" className="h-16 px-6 bg-slate-50 border-none rounded-2xl text-lg font-black shadow-inner w-full focus:ring-2 focus:ring-indigo-500" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">名前</label>
                  <input required placeholder="例: 太郎" className="h-16 px-6 bg-slate-50 border-none rounded-2xl text-lg font-black shadow-inner w-full focus:ring-2 focus:ring-indigo-500" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
              </div>
            </section>

            {/* 職種・キャリアスライダー */}
            <section className="space-y-8">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">職種・入職背景</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">職種</label>
                  <div className="flex p-1.5 bg-slate-100 rounded-[2rem] gap-2">
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setFormData({ ...formData, role: r.id })} className={`flex-1 flex flex-col items-center justify-center py-4 rounded-[1.5rem] transition-all gap-2 ${formData.role === r.id ? 'bg-white shadow-xl text-slate-900 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
                        <r.icon size={24} className={formData.role === r.id ? r.color : 'text-slate-300'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">採用区分</label>
                  <div className="flex p-1.5 bg-slate-100 rounded-[2rem] gap-2">
                    <button type="button" onClick={() => setFormData({ ...formData, isMidCareer: false, preExperienceYears: 0 })} className={`flex-1 flex items-center justify-center py-4 rounded-[1.5rem] transition-all gap-3 ${!formData.isMidCareer ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400'}`}>
                      <GraduationCap size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">新卒入職</span>
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, isMidCareer: true })} className={`flex-1 flex items-center justify-center py-4 rounded-[1.5rem] transition-all gap-3 ${formData.isMidCareer ? 'bg-white shadow-xl text-amber-600' : 'text-slate-400'}`}>
                      <Briefcase size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">中途採用（既卒）</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">現在の合計臨床経験</label>
                  <div className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xl font-black shadow-lg">
                    {formData.experienceYears} <span className="text-xs font-bold ml-1">年目</span>
                  </div>
                </div>
                <input type="range" min="1" max="40" step="1" className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" value={formData.experienceYears} onChange={e => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, experienceYears: val, clinicalLadder: String(Math.min(4, Math.floor(val / 3) + 1)) });
                }} />
                {formData.isMidCareer && (
                  <div className="p-6 bg-white border-2 border-dashed border-amber-200 rounded-[2rem] animate-in slide-in-from-top-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center mb-1"><History size={14} className="mr-2" /> 前職までのキャリア</p>
                      <p className="text-xs font-bold text-slate-400">入職時点で何年の経験がありましたか？</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="number" className="w-20 h-12 bg-slate-50 border-none rounded-xl text-center font-black" value={formData.preExperienceYears} onChange={e => setFormData({ ...formData, preExperienceYears: parseInt(e.target.value) || 0 })} />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Years</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 経験領域履歴（タイムライン）- 復活セクション */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-5 bg-purple-600 rounded-full"></div>
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">経験領域の推移（タイムライン）</h3>
                </div>
                <button type="button" onClick={addExpRow} className="flex items-center space-x-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:opacity-70">
                   <PlusCircle size={16} /> <span>職歴を追加</span>
                </button>
              </div>
              <div className="space-y-4">
                {formData.experienceHistory.map((row, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-left-2 shadow-sm">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 shadow-inner">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">領域</p>
                        <select className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm" value={row.domains[0]} onChange={e => updateExpRow(idx, 'domains', [e.target.value])}>
                          {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">開始年（臨床◯年目）</p>
                        <input type="number" className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm" value={row.startYear} onChange={e => updateExpRow(idx, 'startYear', parseInt(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">終了年</p>
                        <input type="text" className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm" value={row.endYear} onChange={e => updateExpRow(idx, 'endYear', e.target.value)} />
                      </div>
                    </div>
                    {formData.experienceHistory.length > 1 && (
                      <button type="button" onClick={() => removeExpRow(idx)} className="p-3 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ラダー習熟度 */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-amber-500 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">習熟度・ラダー位置</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(level => (
                  <button key={level} type="button" onClick={() => setFormData({ ...formData, clinicalLadder: String(level) })} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-2 ${formData.clinicalLadder === String(level) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl translate-y-[-4px]' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}>
                    <Target size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Level {level}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 学歴・学位 */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-slate-900 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">学歴・養成校・学位</h3>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">出身校（養成施設）</label>
                  <select className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl font-black shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500" value={formData.schoolName} onChange={e => setFormData({ ...formData, schoolName: e.target.value })}>
                    <option value="">養成校リストから選択</option>
                    {SCHOOL_OPTIONS.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 修士課程 */}
                  <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${formData.hasMaster ? 'bg-indigo-50 border-indigo-200 shadow-lg' : 'bg-white border-slate-50'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${formData.hasMaster ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}><GraduationCap size={24} /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master's</p>
                          <p className="text-sm font-black text-slate-900">修士課程 修了</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-6 h-6 rounded-lg accent-indigo-600" checked={formData.hasMaster} onChange={e => setFormData({ ...formData, hasMaster: e.target.checked })} />
                    </div>
                    {formData.hasMaster && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <select className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm" value={formData.masterSchool} onChange={e => setFormData({ ...formData, masterSchool: e.target.value })}>
                          <option value="">大学院を選択</option>
                          {GRAD_SCHOOL_OPTIONS.map(g => (
                            <optgroup key={g.label} label={g.label}>
                              {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {/* 博士課程 */}
                  <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${formData.hasDoctor ? 'bg-indigo-50 border-indigo-200 shadow-lg' : 'bg-white border-slate-50'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${formData.hasDoctor ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}><ShieldCheck size={24} /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctoral</p>
                          <p className="text-sm font-black text-slate-900">博士課程 修了</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-6 h-6 rounded-lg accent-indigo-600" checked={formData.hasDoctor} onChange={e => setFormData({ ...formData, hasDoctor: e.target.checked })} />
                    </div>
                    {formData.hasDoctor && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <select className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm" value={formData.doctorSchool} onChange={e => setFormData({ ...formData, doctorSchool: e.target.value })}>
                          <option value="">大学院を選択</option>
                          {GRAD_SCHOOL_OPTIONS.map(g => (
                            <optgroup key={g.label} label={g.label}>
                              {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 保有資格（超・充実版） */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">保有認定・専門資格</h3>
              </div>
              <div className="space-y-10">
                {CERT_CATEGORIES.filter(cat => cat.id === 'common' || cat.id === formData.role).map(cat => (
                  <div key={cat.id} className="space-y-4">
                    <div className="flex items-center gap-3 ml-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat.label}</p>
                       <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.items.map(cert => (
                        <button key={cert} type="button" onClick={() => toggleCert(cert)} className={`px-4 py-3 rounded-2xl text-[10px] font-bold text-left transition-all border-2 flex items-center justify-between group ${certList.includes(cert) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-[1.02]' : 'bg-white border-slate-50 text-slate-400 hover:border-emerald-100 hover:bg-emerald-50/30'}`}>
                          <span className="line-clamp-2">{cert}</span>
                          <div className={`shrink-0 ml-2 transition-all ${certList.includes(cert) ? 'text-white' : 'text-slate-100 group-hover:text-emerald-200'}`}>
                            <CheckCircle2 size={16} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <PlusCircle size={16} /> その他・自由記述 / 実績
                  </div>
                  <textarea className="w-full h-24 px-6 py-5 bg-white border-none rounded-[1.5rem] text-sm font-bold shadow-inner resize-none focus:ring-2 focus:ring-indigo-500" placeholder="学会発表、地域活動、または上記にない専門研修修了実績などを入力..." value={formData.otherSkills} onChange={e => setFormData({ ...formData, otherSkills: e.target.value })} />
                </div>
              </div>
            </section>

          </form>

          {/* ACTIONS */}
          <div className="p-8 bg-white border-t border-slate-50 shrink-0 flex items-center gap-6 shadow-2xl">
            <button type="button" onClick={onClose} className="hidden md:flex flex-1 h-18 bg-slate-100 text-slate-600 rounded-[2.5rem] font-black items-center justify-center uppercase text-xs tracking-widest">キャンセル</button>
            <button onClick={handleSubmit} className="flex-[2] h-18 bg-slate-900 text-white rounded-[2.5rem] font-black flex items-center justify-center space-x-3 shadow-2xl hover:bg-indigo-600 transition-all uppercase text-sm tracking-widest">
              <Save size={20} /> <span>{editStaff ? '情報を更新' : 'スタッフを登録'}</span>
            </button>
          </div>
        </div>

        {/* REVIEW SIDEBAR */}
        <aside className="hidden lg:flex w-[380px] bg-slate-50 border-l border-slate-100 flex-col overflow-hidden">
          <div className="p-10 flex flex-col h-full space-y-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" />
              <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">Personnel Preview</h4>
            </div>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-sm space-y-6">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Target Personnel</p>
                <p className="text-3xl font-black text-slate-900 leading-none mt-2">{formData.lastName || '---'} {formData.firstName || '---'}</p>
                <p className={`text-[10px] font-black uppercase mt-3 tracking-widest ${ROLES.find(r => r.id === formData.role)?.color}`}>
                   {ROLES.find(r => r.id === formData.role)?.fullLabel}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase">Exp History</p>
                  <p className="text-lg font-black text-slate-900">{formData.experienceYears}yr</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase">Ladder Pos</p>
                  <p className="text-lg font-black text-indigo-600">Level {formData.clinicalLadder}</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[3rem] text-white flex-1 space-y-6 overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 shrink-0">
                 <Award size={18} className="text-amber-400" />
                 <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Registered Credentials</p>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                 {certList.length > 0 ? (
                   certList.map((c, i) => (
                     <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 30}ms` }}>
                        <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5"></div>
                        <p className="text-[11px] font-bold text-indigo-100 opacity-70 leading-tight">{c}</p>
                     </div>
                   ))
                 ) : (
                   <p className="text-[11px] font-bold text-slate-500 italic">No credentials selected</p>
                 )}
              </div>
              <div className="pt-4 border-t border-white/10 shrink-0">
                 <p className="text-[9px] font-black text-slate-500 uppercase">Current Deployment</p>
                 <p className="text-[10px] font-bold text-white/40 mt-1">
                   {formData.experienceHistory[formData.experienceHistory.length - 1]?.domains[0] || "---"} チームに配属
                 </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AddStaffModal;
