
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Users, Plus, Search, FileText, Settings, UserPlus, Trash2, Edit2, HeartPulse, Speech, Award, Filter, Printer, GraduationCap, School, Briefcase, Download, History, BookOpen, Target, Trophy, Database, Sparkles, X, ChevronDown, ChevronUp, LayoutDashboard, Menu, TrendingUp, AlertCircle, PieChart, BarChart, Sliders, ChevronRight, MapPin, ShieldCheck, ArrowUpDown, Lock, Unlock, KeyRound, Eye, EyeOff } from 'lucide-react';
import AIAssistant from './components/AIAssistant';
import StaffReportModal from './components/StaffReportModal';
import AddStaffModal from './components/AddStaffModal';
import LadderConfigModal from './components/LadderConfigModal';

const ROLES = [
  { id: 'pt', label: 'PT', fullLabel: '理学療法士', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', fill: 'bg-blue-600' },
  { id: 'ot', label: 'OT', fullLabel: '作業療法士', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50', fill: 'bg-emerald-600' },
  { id: 'st', label: 'ST', fullLabel: '言語聴覚士', icon: Speech, color: 'text-orange-600', bg: 'bg-orange-50', fill: 'bg-orange-600' },
];

const DOMAIN_OPTIONS = ["AB（回復期）", "C（地域包括ケア・療養）", "D（急性期・外来）", "E（急性期）", "F（訪問）"];

const EXP_STAGES = [
  { id: 'junior', label: '新人 (1-3年)', min: 1, max: 3 },
  { id: 'middle', label: '中堅 (4-10年)', min: 4, max: 10 },
  { id: 'senior', label: 'ベテラン (11年-)', min: 11, max: 100 },
];

type SortKey = 'exp_desc' | 'exp_asc' | 'ladder_desc' | 'ladder_asc' | 'name_asc' | 'cert_count_desc';

const generateRandomStaff = () => {
  const lastNames = ["佐藤", "鈴木", "高橋", "田中", "伊藤", "渡辺", "山本", "中村", "小林", "加藤"];
  const firstNames = ["太郎", "次郎", "花子", "美咲", "健太", "翔太", "愛", "優", "誠", "直樹"];
  const roles = ["pt", "ot", "st"];
  const schools = ["名古屋大学", "藤田医科大学", "日本福祉大学", "中部大学", "星城大学"];
  const exp = Math.floor(Math.random() * 18) + 1;
  const certs = ["登録理学療法士", "認定PT(脳卒中)", "3学会合同呼吸療法認定士", "心臓リハビリテーション指導士", "福祉住環境コーディネーター2級"];
  const randomCerts = certs.slice(0, Math.floor(Math.random() * 4)).join(", ");

  return {
    id: Math.random().toString(36).substr(2, 9),
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    experienceYears: exp,
    clinicalLadder: String(Math.min(4, Math.floor(exp / 3) + 1)),
    status: 'active',
    schoolName: schools[Math.floor(Math.random() * schools.length)],
    certifications: randomCerts,
    hasMaster: Math.random() > 0.8,
    masterSchool: "名古屋大学大学院",
    hasDoctor: false,
    experienceHistory: [
      { domains: [DOMAIN_OPTIONS[Math.floor(Math.random() * DOMAIN_OPTIONS.length)]], startYear: 1, endYear: '現在' }
    ]
  };
};

export default function App() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'staff'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLadderModalOpen, setIsLadderModalOpen] = useState(false);
  const [selectedStaffReport, setSelectedStaffReport] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // パスワード認証モーダル
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [ladderFilter, setLadderFilter] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [expStageFilter, setExpStageFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('exp_desc');

  useEffect(() => {
    const initial = Array.from({ length: 30 }, generateRandomStaff);
    setStaffList(initial);
    setIsLoading(false);
  }, []);

  const stats = useMemo(() => {
    const total = staffList.length;
    if (total === 0) return { total: 0, avgExp: 0, certRate: 0, domainAnalysis: [] };
    const domainAnalysis = DOMAIN_OPTIONS.map(domain => {
      const inDomain = staffList.filter(s => s.experienceHistory?.[s.experienceHistory.length - 1]?.domains?.includes(domain));
      const ladderCounts = { '1': 0, '2': 0, '3': 0, '4': 0 };
      inDomain.forEach(s => { if (ladderCounts[s.clinicalLadder as keyof typeof ladderCounts] !== undefined) ladderCounts[s.clinicalLadder as keyof typeof ladderCounts]++; });
      return { name: domain, total: inDomain.length, ladders: ladderCounts, avgLadder: inDomain.length > 0 ? (inDomain.reduce((sum, s) => sum + parseInt(s.clinicalLadder), 0) / inDomain.length).toFixed(1) : "0.0" };
    });
    return { total, avgExp: (staffList.reduce((acc, s) => acc + s.experienceYears, 0) / total).toFixed(1), certRate: ((staffList.filter(s => s.certifications?.length > 0).length / total) * 100).toFixed(0), domainAnalysis };
  }, [staffList]);

  const processedStaff = useMemo(() => {
    let result = [...staffList];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => `${s.lastName}${s.firstName}`.toLowerCase().includes(q));
    }
    if (roleFilter) result = result.filter(s => s.role === roleFilter);
    if (ladderFilter) result = result.filter(s => s.clinicalLadder === ladderFilter);
    if (domainFilter) result = result.filter(s => s.experienceHistory?.[s.experienceHistory.length - 1]?.domains?.includes(domainFilter));
    if (expStageFilter) {
      const stage = EXP_STAGES.find(st => st.id === expStageFilter);
      if (stage) result = result.filter(s => s.experienceYears >= stage.min && s.experienceYears <= stage.max);
    }
    result.sort((a, b) => {
      switch (sortKey) {
        case 'exp_desc': return b.experienceYears - a.experienceYears;
        case 'exp_asc': return a.experienceYears - b.experienceYears;
        case 'ladder_desc': return parseInt(b.clinicalLadder) - parseInt(a.clinicalLadder);
        case 'ladder_asc': return parseInt(a.clinicalLadder) - parseInt(b.clinicalLadder);
        case 'name_asc': return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`, 'ja');
        case 'cert_count_desc': 
          const aCount = a.certifications ? a.certifications.split(',').length : 0;
          const bCount = b.certifications ? b.certifications.split(',').length : 0;
          return bCount - aCount;
        default: return 0;
      }
    });
    return result;
  }, [staffList, searchQuery, roleFilter, ladderFilter, domainFilter, expStageFilter, sortKey]);

  const handleStaffClick = (s: any) => {
    if (!isAdmin) {
      setIsPasswordModalOpen(true);
      return;
    }
    setSelectedStaffReport(s);
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm("このスタッフ情報を完全に削除してもよろしいですか？")) {
      setStaffList(prev => prev.filter(s => s.id !== id));
      setSelectedStaffReport(null);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '395') {
      setIsAdmin(true);
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 500);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse tracking-widest text-2xl">REHAVIZ HR INITIALIZING...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-slate-900 text-white flex-col shrink-0 z-50 shadow-2xl">
        <div className="p-8 flex items-center space-x-3 border-b border-white/5">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl"><Activity size={24} className="text-white" /></div>
          <span className="font-black text-2xl tracking-tighter">Rehaviz<span className="text-indigo-400">HR</span></span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all ${currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
            <LayoutDashboard size={20} /><span className="font-bold">概況ダッシュボード</span>
          </button>
          <button onClick={() => setCurrentView('staff')} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all ${currentView === 'staff' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
            <Users size={20} /><span className="font-bold">スタッフ名簿管理</span>
          </button>
          {isAdmin && (
            <button onClick={() => setIsLadderModalOpen(true)} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-slate-400 hover:text-white transition-all`}>
              <Sliders size={20} /><span className="font-bold">ラダー要件設定</span>
            </button>
          )}
        </nav>
        <div className="p-6">
          <button onClick={() => setIsAIOpen(true)} className="w-full flex items-center justify-center space-x-3 py-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] font-black shadow-2xl hover:scale-[1.02] transition-all">
            <Sparkles size={18} className="text-yellow-300" />
            <span className="text-xs uppercase tracking-widest">AI 組織・キャリア分析</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
          <h2 className="font-black text-slate-800 text-xl tracking-[0.1em] uppercase">{currentView === 'dashboard' ? 'Dashboard' : 'Directory'}</h2>
          <div className="flex items-center space-x-6">
            <div className="relative group hidden sm:block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input type="text" placeholder="名前で検索..." className="h-11 pl-12 pr-6 bg-slate-50 border-none rounded-2xl text-xs font-bold w-64 focus:ring-2 focus:ring-indigo-500 shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button 
              onClick={handleAdminToggle} 
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isAdmin ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {isAdmin ? <Unlock size={16} /> : <Lock size={16} />}
              {isAdmin ? '管理者ログイン中' : '管理者ログイン'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            {currentView === 'dashboard' ? (
              <div className="space-y-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "スタッフ総数", value: stats.total, unit: "名", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "平均臨床年数", value: stats.avgExp, unit: "年", icon: History, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "専門資格保有", value: stats.certRate, unit: "%", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "平均習熟度", value: (staffList.reduce((s, a) => s + parseInt(a.clinicalLadder), 0) / staffList.length || 0).toFixed(1), unit: "Lv", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <div className={`${item.bg} ${item.color} p-4 rounded-2xl w-fit shadow-inner`}><item.icon size={22} /></div>
                      <div className="mt-8">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                        <h4 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{item.value}<span className="text-base font-bold text-slate-300 ml-1">{item.unit}</span></h4>
                      </div>
                    </div>
                  ))}
                </div>
                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                    <h3 className="font-black text-slate-800 text-2xl uppercase tracking-tighter flex items-center"><PieChart size={24} className="mr-3 text-indigo-500" /> 提供領域別分布</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stats.domainAnalysis.map((domain, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative group hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-slate-900 text-xl tracking-tight">{domain.name}</h4>
                          <div className="text-right">
                             <div className="text-2xl font-black text-indigo-600">{domain.avgLadder}</div>
                             <div className="text-[9px] font-black text-slate-300 uppercase">Avg Ladder</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span>Skill Distribution</span>
                              <span>{domain.total} Staffs</span>
                           </div>
                           <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner">
                              <div className="h-full bg-indigo-600" style={{ width: `${(domain.ladders['4'] / domain.total) * 100 || 0}%` }}></div>
                              <div className="h-full bg-indigo-400" style={{ width: `${(domain.ladders['3'] / domain.total) * 100 || 0}%` }}></div>
                              <div className="h-full bg-slate-300" style={{ width: `${((domain.ladders['1'] + domain.ladders['2']) / domain.total) * 100 || 0}%` }}></div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-8 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 text-white rounded-2xl"><Users size={24} /></div>
                          <h3 className="font-black text-slate-900 text-3xl tracking-tighter">スタッフ名簿管理</h3>
                        </div>
                        {isAdmin && (
                          <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white h-14 px-8 rounded-2xl text-xs font-black flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-600 transition-all uppercase tracking-widest">
                            <Plus size={18} /> <span>追加</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <Activity size={12} /> 職種で抽出
                          </label>
                          <div className="flex flex-wrap p-1.5 bg-slate-100 rounded-3xl gap-1 border border-slate-200/50 shadow-inner">
                            <button onClick={() => setRoleFilter(null)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!roleFilter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Roles</button>
                            {ROLES.map(r => (
                              <button key={r.id} onClick={() => setRoleFilter(r.id)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${roleFilter === r.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                                <r.icon size={14} className={roleFilter === r.id ? r.color : 'text-slate-400'} /> {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <MapPin size={12} /> チーム（領域）で抽出
                          </label>
                          <select className="w-full h-12 px-5 bg-slate-50 border-none rounded-2xl text-xs font-black shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500" value={domainFilter || ''} onChange={e => setDomainFilter(e.target.value || null)}>
                            <option value="">全ての配属チーム</option>
                            {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><History size={12} /> 経験ステージ</label>
                          <select className="w-full h-12 px-5 bg-slate-50 border-none rounded-2xl text-xs font-black shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500" value={expStageFilter || ''} onChange={e => setExpStageFilter(e.target.value || null)}>
                            <option value="">全ての経験年数</option>
                            {EXP_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Target size={12} /> ラダーレベル</label>
                          <select className="w-full h-12 px-5 bg-slate-50 border-none rounded-2xl text-xs font-black shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500" value={ladderFilter || ''} onChange={e => setLadderFilter(e.target.value || null)}>
                            <option value="">全てのラダー</option>
                            {['1', '2', '3', '4'].map(l => <option key={l} value={l}>Level {l}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 text-indigo-600"><ArrowUpDown size={12} /> 並び替え</label>
                          <select className="w-full h-12 px-5 bg-indigo-50 border-none rounded-2xl text-xs font-black shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500 text-indigo-900" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
                            <option value="exp_desc">臨床経験: 長い順</option>
                            <option value="exp_asc">臨床経験: 短い順</option>
                            <option value="ladder_desc">ラダー: 高い順</option>
                            <option value="ladder_asc">ラダー: 低い順</option>
                            <option value="cert_count_desc">資格保有数: 多い順</option>
                            <option value="name_asc">名前順 (50音)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {processedStaff.length} / {staffList.length} Professionals</p>
                  <button onClick={() => { setRoleFilter(null); setLadderFilter(null); setDomainFilter(null); setExpStageFilter(null); setSearchQuery(''); }} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">フィルタをリセット</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {processedStaff.map(s => {
                    const role = ROLES.find(r => r.id === s.role) || ROLES[0];
                    const certCount = s.certifications ? s.certifications.split(',').length : 0;
                    return (
                      <div key={s.id} onClick={() => handleStaffClick(s)} className={`bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all relative flex flex-col group ${isAdmin ? 'hover:shadow-2xl hover:border-indigo-100 cursor-pointer' : 'cursor-default opacity-85'}`}>
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); setEditingStaff(s); }} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-2xl opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-white transition-all shadow-lg z-10"><Edit2 size={18} /></button>
                        )}
                        <div className="flex items-start justify-between mb-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-4 ${role.bg} ${role.color}`}>{s.lastName[0]}</div>
                          <div className="text-right">
                            <span className={`inline-block px-4 py-2 rounded-xl text-[11px] font-black border uppercase tracking-widest mb-2 ${role.bg} ${role.color}`}>{role.fullLabel}</span>
                            <div className="flex items-center justify-end text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit ml-auto">
                               <Target size={14} className="mr-1.5" />
                               <p className="text-[10px] font-black uppercase tracking-widest">Level {s.clinicalLadder}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 mb-8">
                          <h4 className="font-black text-slate-900 text-3xl tracking-tighter leading-none">{s.lastName} {s.firstName}</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <History size={12} className="mr-1.5 text-slate-300" /> {s.experienceYears}年目
                            </div>
                            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <MapPin size={12} className="mr-1.5 text-slate-300" /> {s.experienceHistory?.[s.experienceHistory.length - 1]?.domains?.[0] || '未配属'}
                            </div>
                          </div>
                        </div>
                        {isAdmin ? (
                          <div className="bg-indigo-50/30 rounded-[2.5rem] p-6 space-y-4 flex-1 border border-indigo-100/20">
                            <div className="flex items-center text-slate-600 text-xs font-bold truncate"><School size={16} className="mr-3 text-indigo-400 shrink-0" />{s.schoolName}</div>
                            <div className="flex items-start text-slate-500 text-[11px] font-black line-clamp-2 uppercase tracking-tighter leading-snug border-t border-indigo-100/50 pt-4">
                              <Award size={18} className="mr-3 text-amber-500 shrink-0" /> {s.certifications ? `${certCount}件保有` : '資格なし'}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center space-y-3 flex-1 border border-dashed border-slate-200">
                            <Lock size={20} className="text-slate-300" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">詳細データは非表示です</p>
                          </div>
                        )}
                        {isAdmin && (
                          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-500 transition-all">
                            <span>View Detail Report</span>
                            <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* パスワード認証モーダル */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className={`bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200 ${passwordError ? 'animate-shake' : ''}`}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
                <KeyRound size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">管理者認証</h3>
                <p className="text-sm font-bold text-slate-400">詳細情報を閲覧するにはパスワードが必要です</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <input 
                    autoFocus
                    type="password"
                    placeholder="••••"
                    className={`w-full h-16 px-8 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black tracking-[0.5em] transition-all outline-none ${passwordError ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-transparent focus:border-indigo-500'}`}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                  />
                  {passwordError && (
                    <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-black text-rose-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">パスワードが正しくありません</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsPasswordModalOpen(false); setPasswordInput(''); setPasswordError(false); }}
                  className="flex-1 h-14 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="flex-[2] h-14 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all"
                >
                  認証する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* スタイル追加（揺れるアニメーション） */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} staffList={staffList} />
      <StaffReportModal isOpen={!!selectedStaffReport} onClose={() => setSelectedStaffReport(null)} staff={selectedStaffReport} onDelete={handleDeleteStaff} />
      <AddStaffModal isOpen={isAddModalOpen || !!editingStaff} onClose={() => { setIsAddModalOpen(false); setEditingStaff(null); }} onAdd={newStaff => setStaffList(prev => [newStaff, ...prev])} onUpdate={updated => { setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s)); setEditingStaff(null); }} editStaff={editingStaff} />
      <LadderConfigModal isOpen={isLadderModalOpen} onClose={() => setIsLadderModalOpen(false)} />
    </div>
  );
}
