
import React, { useState, useEffect } from 'react';
import { X, Target, BookOpen, Users, Settings, Trophy, ChevronRight, Save, ShieldCheck, Activity, CheckCircle2, Edit3, Type, FileText } from 'lucide-react';

interface LadderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_LADDER_CONFIG = [
  { level: 1, label: '新人レベル', color: 'bg-slate-200', text: 'text-slate-600', description: '指導のもとで基本的な業務を遂行できる。', requirements: { clinical: '基本的なリハ評価・介入の実施', education: '研修会への積極的な参加', management: '報告・連絡・相談の徹底', research: 'ケーススタディへの取り組み' } },
  { level: 2, label: '中堅導入レベル', color: 'bg-indigo-400', text: 'text-white', description: '自立して標準的な業務を遂行し、一部指導に回る。', requirements: { clinical: '複数領域の標準的プログラム立案', education: '新人・実習生への部分的な指導', management: '病棟連携・会議での発言', research: '学会発表（共同演者以上）' } },
  { level: 3, label: '中堅成熟レベル', color: 'bg-indigo-600', text: 'text-white', description: '専門性を発揮し、チームのリーダー的役割を果たす。', requirements: { clinical: '難治症例への対応・助言', education: 'プリセプターとしての継続指導', management: '係活動・委員会での中心的な役割', research: '学会発表（筆頭）・論文投稿' } },
  { level: 4, label: '管理者・専門職レベル', color: 'bg-slate-900', text: 'text-white', description: '部門全体の管理や高度な専門的指導を行う。', requirements: { clinical: 'エビデンス構築と院外指導', education: '教育プログラムの構築・運営', management: '予算・人員配置の調整・管理', research: '外部研究費の獲得・査読者' } },
];

const LadderConfigModal: React.FC<LadderConfigModalProps> = ({ isOpen, onClose }) => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [config, setConfig] = useState(DEFAULT_LADDER_CONFIG);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('rehaviz_ladder_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }, []);

  if (!isOpen) return null;

  const currentLevel = config.find(l => l.level === selectedLevel)!;

  const updateField = (field: string, value: string) => {
    setIsSaved(false);
    setConfig(prev => prev.map(l => l.level === selectedLevel ? { ...l, [field]: value } : l));
  };

  const updateRequirement = (field: string, value: string) => {
    setIsSaved(false);
    setConfig(prev => prev.map(l => l.level === selectedLevel ? { ...l, requirements: { ...l.requirements, [field]: value } } : l));
  };

  const handleSave = () => {
    localStorage.setItem('rehaviz_ladder_config', JSON.stringify(config));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200"><Target size={24} /></div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">クリニカルラダー構成編集</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Ladder Customization</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isSaved && (
              <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                <CheckCircle2 size={14} className="mr-1" /> 設定を保存しました
              </span>
            )}
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Level Selector Sidebar */}
          <div className="w-full md:w-72 bg-slate-50/50 border-r border-slate-100 p-6 space-y-3 overflow-y-auto no-scrollbar">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Select Level to Edit</p>
            {config.map(l => (
              <button 
                key={l.level} 
                onClick={() => setSelectedLevel(l.level)}
                className={`w-full p-6 rounded-[2rem] text-left transition-all flex flex-col justify-center border-2 ${selectedLevel === l.level ? 'bg-white shadow-xl shadow-indigo-100/50 border-indigo-600/20 translate-x-1' : 'bg-transparent border-transparent opacity-60 hover:opacity-100'}`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedLevel === l.level ? 'text-indigo-600' : 'text-slate-400'}`}>Level {l.level}</span>
                <span className="font-black text-slate-900 tracking-tight line-clamp-1">{l.label}</span>
              </button>
            ))}
            
            <div className="mt-12 p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center"><Edit3 size={12} className="mr-1" /> Customization</p>
              <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed">レベル名称や要件を書き換えて、施設独自のラダーを作成してください。</p>
            </div>
          </div>

          {/* Requirement Editor */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar bg-white">
            <div className="max-w-3xl space-y-12">
              
              {/* Level Name & Description Editing */}
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className={`inline-block px-4 py-1.5 rounded-xl ${currentLevel.color} ${currentLevel.text} text-[10px] font-black uppercase tracking-[0.2em]`}>Editing Level {currentLevel.level}</div>
                
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Type size={12} className="mr-1.5" /> レベル名称（ラベル）
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-5 text-2xl font-black text-slate-900 shadow-sm transition-all"
                      value={currentLevel.label}
                      onChange={e => updateField('label', e.target.value)}
                      placeholder="例: 新人レベル"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <FileText size={12} className="mr-1.5" /> 役割・定義の概要
                    </label>
                    <textarea 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-5 text-sm font-bold text-slate-600 focus:ring-0 min-h-[100px] resize-none leading-relaxed transition-all"
                      value={currentLevel.description}
                      onChange={e => updateField('description', e.target.value)}
                      placeholder="このレベルのスタッフに期待される役割を記述してください..."
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Requirements Editing */}
              <div className="space-y-8">
                <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <Settings size={20} className="mr-2 text-indigo-600" /> 領域別詳細要件
                </h4>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { id: 'clinical', label: '臨床実践能力', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { id: 'education', label: '教育・指導能力', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { id: 'management', label: '組織・管理能力', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { id: 'research', label: '研究・探求能力', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50' }
                  ].map(cat => (
                    <div key={cat.id} className="space-y-4 p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3">
                        <div className={`${cat.bg} ${cat.color} p-3 rounded-2xl`}><cat.icon size={20} /></div>
                        <span className="font-black text-slate-800 text-base tracking-tight">{cat.label}</span>
                      </div>
                      <textarea 
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none leading-relaxed"
                        value={(currentLevel.requirements as any)[cat.id]}
                        onChange={e => updateRequirement(cat.id, e.target.value)}
                        placeholder={`${cat.label}の具体的なチェックリストや基準を入力...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-6 bg-white/80 backdrop-blur-md py-4 z-10">
                <button 
                  onClick={handleSave} 
                  className="w-full h-18 bg-slate-900 text-white rounded-[2rem] font-black flex items-center justify-center space-x-3 shadow-2xl hover:bg-indigo-600 active:scale-95 transition-all group"
                >
                  <Save size={20} className="group-hover:animate-pulse" />
                  <span className="uppercase tracking-widest text-sm">施設全体のマスターとして保存</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LadderConfigModal;
