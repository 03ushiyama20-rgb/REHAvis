
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface TeamAnalysis {
  role: string;
  count: number;
  avgExp: number;
  mainFocus: string;
  challenge: string;
}

export interface DomainDistribution {
  stage: string; 
  domainBreakdown: { domain: string, count: number, avgLadder: number }[];
}

export interface DomainInsight {
  domain: string;
  strength: string;
  risk: string;
  optimalLadderBalance: string;
}

export interface AnalysisResponse {
  summary: string;
  recommendations: string[];
  strengths: string[];
  teamAnalyses: TeamAnalysis[];
  domainDistribution: DomainDistribution[];
  domainInsights: DomainInsight[];
  careerPathInsight: string;
}

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.status === 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const analyzeStaffData = async (staffList: any[]): Promise<AnalysisResponse> => {
  const ai = getAIClient();
  
  const context = staffList.map(s => ({
    r: s.role,
    e: s.experienceYears,
    l: s.clinicalLadder,
    d: s.experienceHistory?.[s.experienceHistory.length - 1]?.domains?.[0] || 'N/A',
    c: s.certifications?.length > 0 ? 'Yes' : 'No',
  }));

  const prompt = `リハビリテーション部門の組織分析を行ってください。特に提供領域（AB:回復期, C:地域包括, D/E:急性期等）ごとのチーム分析に注力してください。
  データ: ${JSON.stringify(context)}
  
  以下の構造でJSON出力してください：
  1. summary: 全体サマリー（150字以内）
  2. teamAnalyses: PT/OT/ST毎の分析
  3. domainDistribution: 経験年数別の領域分布と平均ラダー
  4. domainInsights: 各領域（AB, C, D, E, F）ごとの「強み」「リスク」「理想的なラダー構成」の洞察
  5. careerPathInsight: 組織のキャリアパスに関する洞察
  6. recommendations: 3つの具体的改善案
  7. strengths: 組織の3つの強み`;

  return await fetchWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            teamAnalyses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                  avgExp: { type: Type.NUMBER },
                  mainFocus: { type: Type.STRING },
                  challenge: { type: Type.STRING }
                },
                required: ["role", "count", "avgExp", "mainFocus", "challenge"]
              }
            },
            domainDistribution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING },
                  domainBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        domain: { type: Type.STRING },
                        count: { type: Type.NUMBER },
                        avgLadder: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            },
            domainInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  domain: { type: Type.STRING },
                  strength: { type: Type.STRING },
                  risk: { type: Type.STRING },
                  optimalLadderBalance: { type: Type.STRING }
                },
                required: ["domain", "strength", "risk", "optimalLadderBalance"]
              }
            },
            careerPathInsight: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "teamAnalyses", "domainDistribution", "domainInsights", "careerPathInsight", "recommendations", "strengths"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  });
};
