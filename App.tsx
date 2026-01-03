
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Users, Plus, Search, FileText, Settings, UserPlus, Trash2, Edit2, HeartPulse, Speech, Award, Filter, Printer, GraduationCap, School, Briefcase, Download, History, BookOpen, Target, Trophy, Database, Sparkles, X, ChevronDown, ChevronUp, LayoutDashboard, Menu, TrendingUp, AlertCircle, PieChart, BarChart, Sliders, ChevronRight, MapPin, ShieldCheck, ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow, SortAsc, SortDesc, Zap } from 'lucide-react';
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

const DOMAIN_COLORS: Record<string, string> = {
  "AB（回復期）": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "C（地域包括ケア・療養）": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "D（急性期・外来）": "bg-amber-50 text-amber-600 border-amber-100",
  "E（急性期）": "bg-rose-50 text-rose-600 border-rose-100",
  "F（訪問）": "bg-slate-50 text-slate-600 border-slate-100"
};

type SortKey = 'exp_desc' | 'exp_asc' | 'ladder_desc' | 'ladder_asc' | 'name_asc' | 'cert_count_desc';

const generateRandomStaff = () => {
  const lastNames = ["佐藤", "鈴木", "高橋", "田中", "伊藤", "渡辺", "山本", "中村", "小林", "加藤"];
  const firstNames = ["太郎", "次郎", "花子", "美咲", "健太", "翔太", "愛", "優", "誠", "直樹"];
  const roles = ["pt", "ot", "st"];
  const certs = ["認定PT(脳卒中)", "認定PT(運動器)", "心臓リハビリテーション指導士", "臨床実習指導者講習会修了", "地域包括ケア推進リーダー", "3学会合同呼吸療法認定士", "専門PT(基礎)"];
  const schools = ["名古屋大学", "藤田医科大学", "日本福祉大学", "中部大学", "星城大学"];
  const exp = Math.floor(Math.random() * 18) + 1;
  
  const assignedCerts = exp > 3 
    ? certs.sort(() => 0.5 - Math.random()).slice(0, Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 1).join(", ")
    : "";

  return {
    id: Math.random().toString(36).substr(2, 9),
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    experienceYears: exp,
    clinicalLadder: String(Math.min(4, Math.floor(exp / 3) + 1)),
    status: 'active',
    schoolName: schools[Math.floor(Math.random() * schools.length)],
    certifications: assignedCerts,
    hasMaster: Math.random() > 0.8,
    masterSchool: Math.random() > 0.8 ? "名古屋大学大学院" : "",
    hasDoctor: Math.random() > 0.95,
    doctorSchool: Math.random() > 0.95 ? "名古屋市立大学大学院" : "",
    experienceHistory: [
      { domains: [DOMAIN_OPTIONS[Math.floor(Math.random() * 2)]], startYear: 1, endYear: '3' },
      { domains: [DOMAIN_OPTIONS[Math.floor(Math.random() * 3) + 2]], startYear: 4, endYear: '現在' }
    ],
    achievements: exp > 8 ? [
      { type: '学会発表', title: '早期離床のプロトコル導入', date: '2023-12' }
    ] : []
  };
};

export default function App() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'staff' | 'config'>('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLadderModalOpen, setIsLadderModalOpen] = useState(false);
  const [selectedStaffReport, setSelectedStaffReport] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // フィルタとソートの状態
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [ladderFilter, setLadderFilter] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('exp_desc');

  useEffect(() => {
    const initial = Array.from({ length: 25 }, generateRandomStaff);
    setStaffList(initial);
    setIsLoading(false);
  }, []);

  const stats = useMemo(() => {
    const total = staffList.length;
    if (total === 0) return { total: 0, avgExp: 0, certRate: 0, masterCount: 0, roleData: {}, domainAnalysis: [] };

    const avgExp = (staffList.reduce((acc, s) => acc + s.experienceYears, 0) / total).toFixed(1);
    const certRate = ((staffList.filter(s => s.certifications && s.certifications.length > 0).length / total) * 100).toFixed(0);
    const masterCount = staffList.filter(s => s.hasMaster || s.hasDoctor).length;

    const roleData = ROLES.reduce((acc, role) => {
      const filtered = staffList.filter(s => s.role === role.id);
      const count = filtered.length;
      acc[role.id] = {
        count,
        avgExp: count > 0 ? (filtered.reduce((sum, s) => sum + s.experienceYears, 0) / count).toFixed(1) : 0,
        certCount: filtered.filter(s => s.certifications && s.certifications.length > 0).length,
        ladderAvg: count > 0 ? (filtered.reduce((sum, s) => sum + parseInt(s.clinicalLadder), 0) / count).toFixed(1) : 0
      };
      return acc;
    }, {} as any);

    const domainAnalysis = DOMAIN_OPTIONS.map(domain => {
      const inDomain = staffList.filter(s => s.experienceHistory?.[s.experienceHistory.length - 1]?.domains?.includes(domain));
      const ladderCounts = { '1': 0, '2': 0, '3': 0, '4': 0 };
      inDomain.forEach(s => {
        if (ladderCounts[s.clinicalLadder as keyof typeof ladderCounts] !== undefined) {
          ladderCounts[s.clinicalLadder as keyof typeof ladderCounts]++;
        }
      });
      return {
        name: domain,
        total: inDomain.length,
        ladders: ladderCounts,
        avgLadder: inDomain.length > 0 ? (inDomain.reduce((sum, s) => sum + parseInt(s.clinicalLadder), 0) / inDomain.length).toFixed(1) : "0.0"
      };
    });

    return { total, avgExp, certRate, masterCount, roleData, domainAnalysis };
  }, [staffList]);

  const processedStaff = useMemo(() => {
    let result = [...staffList];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        `${s.lastName}${s.firstName}`.toLowerCase().includes(q) ||
        (s.certifications || '').toLowerCase().includes(q) ||
        s.schoolName.toLowerCase().includes(q)
      );
    }

    if (roleFilter) result = result.filter(s => s.role === roleFilter);
    if (ladderFilter) result = result.filter(s => s.clinicalLadder === ladderFilter);
    if (domainFilter) result = result.filter(s => s.experienceHistory?.[s.experienceHistory.length - 1]?.domains?.includes(domainFilter));

    result.sort((a, b) => {
      const getCertCount = (s: any) => s.certifications ? s.certifications.split(',').filter((c: string) => c.trim().length > 0).length : 0;
      switch (sortKey) {
        case 'exp_desc': return b.experienceYears - a.experienceYears;
        case 'exp_asc': return a.experienceYears - b.experienceYears;
        case 'ladder_desc': return parseInt(b.clinicalLadder) - parseInt(a.clinicalLadder);
        case 'ladder_asc': return parseInt(a.clinicalLadder) - parseInt(b.clinicalLadder);
        case 'name_asc': return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`, 'ja');
        case 'cert_count_desc': return getCertCount(b) - getCertCount(a);
        default: return 0;
      }
    });

    return result;
  }, [staffList, searchQuery, roleFilter, ladderFilter, domainFilter, sortKey]);

  const handleAddStaff = (newStaff: any) => setStaffList(prev => [newStaff, ...prev]);
  const handleUpdateStaff = (updatedStaff: any) => {
    setStaffList(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    setEditingStaff(null);
  };
  const handleDeleteStaff = (id: string) => {
    if (confirm("このスタッフを削除してもよろしいですか？")) {
      setStaffList(prev => prev.filter(s => s.id !== id));
      setSelectedStaffReport(null);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse tracking-widest text-2xl">REHAVIZ HR INITIALIZING...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-slate-900 text-white flex-col shrink-0 z-50 shadow-2xl">
        <div className="p-8 flex items-center space-x-3 border-b border-white/5">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20"><Activity size={24} className="text-white" /></div>
          <span className="font-black text-2xl tracking-tighter">Rehaviz<span className="text-indigo-400">HR</span></span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 ${currentView === 'dashboard' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/30 text-white translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={20} /><span className="font-bold">概況ダッシュボード</span>
          </button>
          <button onClick={() => setCurrentView('staff')} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 ${currentView === 'staff' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/30 text-white translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Users size={20} /><span className="font-bold">スタッフ名簿管理</span>
          </button>
          <button onClick={() => setIsLadderModalOpen(true)} className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 text-slate-400 hover:bg-white/5 hover:text-white`}>
            <Sliders size={20} /><span className="font-bold">ラダー要件設定</span>
          </button>
        </nav>
        <div className="p-6">
          <button onClick={() => setIsAIOpen(true)} className="w-full flex items-center justify-center space-x-3 py-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] font-black shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Sparkles size={18} className="text-yellow-300" />
            <span className="text-xs uppercase tracking-widest">AI 組織・キャリア分析</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0 z-40">
          <div className="flex items-center space-x-3 md:hidden">
            <Activity size={24} className="text-indigo-600" />
            <span className="font-black text-xl tracking-tight">Rehaviz</span>
          </div>
          <h2 className="hidden md:block font-black text-slate-800 text-xl tracking-tight uppercase tracking-[0.1em]">{currentView === 'dashboard' ? 'Dashboard' : 'Directory'}</h2>
          <div className="flex items-center space-x-4">
            <div className="relative group hidden sm:block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="名前・学校・資格で検索..." 
                className="h-11 pl-12 pr-6 bg-slate-50 border-none rounded-2xl text-xs font-bold w-64 focus:ring-2 focus:ring-indigo-500 shadow-inner"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-32 md:pb-10">
            {currentView === 'dashboard' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
                {/* AI Summary Card */}
                <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                  <div className="absolute top-0 right-0 p-10 opacity-10"><Sparkles size={160} /></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-indigo-200 text-[11px] font-black uppercase tracking-[0.2em] bg-white/10 w-fit px-4 py-1.5 rounded-full">
                        <Zap size={14} className="text-yellow-300" /> <span>Real-time Organization Insight</span>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">AIが組織を診断</h3>
                      <p className="text-indigo-100/90 text-lg font-bold max-w-2xl leading-relaxed">現在のスタッフ構成では「急性期」のラダーLv.2が不足しています。新人の早期戦力化を優先すべきです。</p>
                    </div>
                    <button onClick={() => setIsAIOpen(true)} className="bg-white text-indigo-600 h-16 px-10 rounded-[2rem] font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest shrink-0">レポートを開く</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "スタッフ総数", value: stats.total, unit: "名", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "平均臨床年数", value: stats.avgExp, unit: "年", icon: History, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "専門資格保有", value: stats.certRate, unit: "%", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "平均習熟度", value: (staffList.reduce((s, a) => s + parseInt(a.clinicalLadder), 0) / staffList.length || 0).toFixed(1), unit: "Lv", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all hover:-translate-y-1">
                      <div className={`${item.bg} ${item.color} p-4 rounded-2xl w-fit shadow-inner`}><item.icon size={22} /></div>
                      <div className="mt-8">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                        <h4 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{item.value}<span className="text-base font-bold text-slate-300 ml-1 tracking-normal">{item.unit}</span></h4>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Domain Distribution Grid */}
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
                              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${(domain.ladders['4'] / domain.total) * 100 || 0}%` }}></div>
                              <div className="h-full bg-indigo-400 transition-all duration-1000" style={{ width: `${(domain.ladders['3'] / domain.total) * 100 || 0}%` }}></div>
                              <div className="h-full bg-slate-300 transition-all duration-1000" style={{ width: `${((domain.ladders['1'] + domain.ladders['2']) / domain.total) * 100 || 0}%` }}></div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                {/* Advanced Control Panel */}
                <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl"><Users size={24} /></div>
                        <h3 className="font-black text-slate-900 text-3xl tracking-tighter">スタッフ名簿管理</h3>
                      </div>
                      
                      {/* Role Segmented Control - THE BIG CHANGE */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">職種選択</p>
                        <div className="flex p-1.5 bg-slate-100 rounded-3xl w-fit border border-slate-200/50 shadow-inner">
                          <button 
                            onClick={() => setRoleFilter(null)} 
                            className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${!roleFilter ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            All Roles
                          </button>
                          {ROLES.map(r => (
                            <button 
                              key={r.id} 
                              onClick={() => setRoleFilter(r.id)} 
                              className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${roleFilter === r.id ? 'bg-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              <r.icon size={16} className={roleFilter === r.id ? r.color : 'text-slate-400'} />
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 shrink-0 self-end lg:self-center">
                      <div className="relative">
                        <select 
                          className="h-16 pl-12 pr-12 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs font-black uppercase tracking-widest appearance-none shadow-sm cursor-pointer hover:bg-white transition-all"
                          value={sortKey}
                          onChange={e => setSortKey(e.target.value as SortKey)}
                        >
                          <option value="exp_desc">臨床経験：長い順</option>
                          <option value="exp_asc">臨床経験：短い順</option>
                          <option value="ladder_desc">ラダー：高い順</option>
                          <option value="ladder_asc">ラダー：低い順</option>
                          <option value="cert_count_desc">保有資格：多い順</option>
                          <option value="name_asc">氏名：五十音順</option>
                        </select>
                        <Award size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white h-16 px-10 rounded-2xl text-sm font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest group">
                        <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                        <span>新規追加</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    {/* Team Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <MapPin size={14} /> 所属チーム
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setDomainFilter(null)} 
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${!domainFilter ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                        >
                          All Teams
                        </button>
                        {DOMAIN_OPTIONS.map(d => (
                          <button 
                            key={d} 
                            onClick={() => setDomainFilter(domainFilter === d ? null : d)} 
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${domainFilter === d ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                          >
                            {d.split('（')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Ladder Filter */}
                    <div className="space-y-4 md:border-l md:pl-8 border-slate-100">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Target size={14} /> 習熟度 (Ladder)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4].map(l => (
                          <button 
                            key={l} 
                            onClick={() => setLadderFilter(ladderFilter === String(l) ? null : String(l))} 
                            className={`w-14 h-11 rounded-xl text-xs font-black border transition-all ${ladderFilter === String(l) ? 'bg-amber-500 text-white border-amber-500 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                          >
                            Lv.{l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {processedStaff.map(s => {
                    const role = ROLES.find(r => r.id === s.role) || ROLES[0];
                    const currentDomain = s.experienceHistory?.[s.experienceHistory.length - 1]?.domains?.[0] || 'Unknown';
                    const certCount = s.certifications ? s.certifications.split(',').filter((c: string) => c.trim().length > 0).length : 0;

                    return (
                      <div key={s.id} onClick={() => setSelectedStaffReport(s)} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group relative flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        {/* Highlights */}
                        <div className="absolute -top-3 left-10 flex gap-2">
                           {certCount >= 3 && (
                             <span className="bg-amber-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest flex items-center border-2 border-white animate-bounce">
                               <Trophy size={12} className="mr-1.5" /> Multi Expert
                             </span>
                           )}
                           {parseInt(s.clinicalLadder) === 4 && (
                             <span className="bg-slate-900 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest flex items-center border-2 border-white">
                               <ShieldCheck size={12} className="mr-1.5" /> Leader
                             </span>
                           )}
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingStaff(s); }} 
                          className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-2xl opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-white transition-all z-10 shadow-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        
                        <div className="flex items-start justify-between mb-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-4 shadow-inner ${role.bg} ${role.color}`}>{s.lastName[0]}</div>
                          <div className="text-right">
                            <span className={`inline-block px-4 py-2 rounded-xl text-[11px] font-black border uppercase tracking-widest mb-2 ${role.bg} ${role.color}`}>{role.fullLabel}</span>
                            <div className="flex items-center justify-end text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit ml-auto">
                               <Target size={14} className="mr-1.5" />
                               <p className="text-[10px] font-black uppercase tracking-widest">Ladder Lv.{s.clinicalLadder}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-8">
                          <h4 className="font-black text-slate-900 text-3xl tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{s.lastName} {s.firstName}</h4>
                          <div className="flex items-center text-slate-400 text-[11px] font-black uppercase tracking-widest">
                            <History size={14} className="mr-2 text-slate-300" /> 臨床経験 {s.experienceYears}年目
                          </div>
                        </div>

                        {/* Team Indicator */}
                        <div className="mb-8">
                          <div className="flex items-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
                             <MapPin size={12} className="mr-2" /> Current Unit
                          </div>
                          <div className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${DOMAIN_COLORS[currentDomain]?.split(' ')[1] || 'bg-slate-300'} shadow-sm animate-pulse`}></div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">
                              {currentDomain}
                            </span>
                          </div>
                        </div>

                        <div className="bg-indigo-50/30 rounded-[2.5rem] p-6 space-y-4 flex-1 border border-indigo-100/20">
                          <div className="flex items-center text-slate-600 text-xs font-bold truncate">
                            <School size={16} className="mr-3 text-indigo-400 shrink-0" />
                            {s.schoolName}
                          </div>
                          <div className="flex items-start text-slate-500 text-[11px] font-black leading-tight border-t border-indigo-100/50 pt-4">
                            <div className="relative shrink-0 mr-3">
                              <Award size={18} className="text-amber-500" />
                              {certCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-indigo-600 text-white text-[8px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm">
                                  {certCount}
                                </span>
                              )}
                            </div>
                            <span className="line-clamp-2 uppercase tracking-tighter leading-snug">
                              {s.certifications || <span className="text-slate-300 italic">No certifications registered</span>}
                            </span>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-500 transition-all">
                          <span>View Detail Report</span>
                          <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] px-10 flex items-center justify-between z-[60] shadow-2xl border border-white/10">
          <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center space-y-1 ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}><LayoutDashboard size={24} strokeWidth={3} /><span className="text-[9px] font-black uppercase tracking-widest">Dash</span></button>
          <button onClick={() => setIsAIOpen(true)} className="flex flex-col items-center -mt-12 group"><div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white border-4 border-[#F8FAFC] shadow-2xl group-active:scale-90 transition-transform"><Sparkles size={28} /></div></button>
          <button onClick={() => setCurrentView('staff')} className={`flex flex-col items-center space-y-1 ${currentView === 'staff' ? 'text-indigo-400' : 'text-slate-500'}`}><Users size={24} strokeWidth={3} /><span className="text-[9px] font-black uppercase tracking-widest">List</span></button>
        </nav>
      </main>

      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} staffList={staffList} />
      <StaffReportModal isOpen={!!selectedStaffReport} onClose={() => setSelectedStaffReport(null)} staff={selectedStaffReport} onDelete={handleDeleteStaff} />
      <AddStaffModal isOpen={isAddModalOpen || !!editingStaff} onClose={() => { setIsAddModalOpen(false); setEditingStaff(null); }} onAdd={handleAddStaff} onUpdate={handleUpdateStaff} editStaff={editingStaff} />
      <LadderConfigModal isOpen={isLadderModalOpen} onClose={() => setIsLadderModalOpen(false)} />
    </div>
  );
}
