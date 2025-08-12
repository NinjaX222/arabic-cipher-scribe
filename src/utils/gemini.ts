import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini AI Configuration
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string) {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw new Error('فشل في تهيئة Gemini API');
    }
  }

  async generateMultimodalKey(data: {
    text?: string;
    imageBase64?: string;
    audioData?: string;
    videoData?: string;
  }): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini not initialized. Please provide API key.');
    }

    try {
      const prompt = `
        تحليل البيانات متعددة الأنماط التالية وإنشاء مفتاح تشفير فريد ومعقد:
        ${data.text ? `النص: ${data.text}` : ''}
        ${data.imageBase64 ? 'تم توفير صورة للتحليل' : ''}
        ${data.audioData ? 'تم توفير ملف صوتي للتحليل' : ''}
        ${data.videoData ? 'تم توفير ملف فيديو للتحليل' : ''}
        
        قم بتحليل الخصائص التالية:
        - في النص: الكلمات المفتاحية، التكرارات، الطول
        - في الصورة: الألوان السائدة، الكائنات، التباين
        - في الصوت: التردد، المدة، النبرة
        - في الفيديو: الحركة، الألوان، المشاهد
        
        أنشئ مفتاح تشفير من 64 حرف يحتوي على أرقام وحروف ورموز خاصة بناءً على هذا التحليل.
        أرجع المفتاح فقط بدون أي نص إضافي.
      `;

      const parts: any[] = [prompt];
      
      if (data.imageBase64) {
        parts.push({
          inlineData: {
            data: data.imageBase64,
            mimeType: "image/jpeg"
          }
        });
      }

      const result = await this.model.generateContent(parts);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating multimodal key:', error);
      throw new Error('فشل في توليد مفتاح التشفير متعدد الأنماط');
    }
  }

  async generateIntelligentKey(fileData: {
    name: string;
    size: number;
    type: string;
    content?: string;
  }): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini not initialized. Please provide API key.');
    }

    try {
      const prompt = `
        قم بتحليل خصائص الملف التالي وإنشاء مفتاح تشفير ذكي وفريد:
        
        اسم الملف: ${fileData.name}
        حجم الملف: ${fileData.size} بايت
        نوع الملف: ${fileData.type}
        ${fileData.content ? `محتوى الملف: ${fileData.content.substring(0, 1000)}...` : ''}
        
        قم بتحليل:
        - نمط اسم الملف وامتداده
        - حجم الملف وتأثيره على التعقيد
        - نوع المحتوى وخصائصه الفريدة
        - إنشاء بصمة رقمية للملف
        
        أنشئ مفتاح تشفير من 64 حرف معقد ومخصص لهذا الملف تحديداً.
        استخدم مزيج من الأرقام والحروف والرموز الخاصة.
        أرجع المفتاح فقط.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating intelligent key:', error);
      throw new Error('فشل في توليد مفتاح ذكي');
    }
  }

  async analyzeSecurity(encryptionData: {
    algorithm: string;
    keyLength: number;
    dataSize: number;
    encryptionTime: number;
    patterns: string[];
  }): Promise<{
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    threats: string[];
    recommendations: string[];
    shouldChangeAlgorithm: boolean;
    newAlgorithm?: string;
  }> {
    if (!this.model) {
      throw new Error('Gemini not initialized. Please provide API key.');
    }

    try {
      const prompt = `
        قم بتحليل أمان عملية التشفير التالية:
        
        الخوارزمية المستخدمة: ${encryptionData.algorithm}
        طول المفتاح: ${encryptionData.keyLength} بت
        حجم البيانات: ${encryptionData.dataSize} بايت
        وقت التشفير: ${encryptionData.encryptionTime} ملي ثانية
        الأنماط المكتشفة: ${encryptionData.patterns.join(', ')}
        
        قم بتقييم:
        1. مستوى الأمان (منخفض/متوسط/عالي/حرج)
        2. التهديدات المحتملة
        3. التوصيات لتحسين الأمان
        4. هل يجب تغيير الخوارزمية؟
        5. خوارزمية بديلة إذا لزم الأمر
        
        أرجع النتيجة بصيغة JSON:
        {
          "securityLevel": "high",
          "threats": ["قائمة التهديدات"],
          "recommendations": ["قائمة التوصيات"],
          "shouldChangeAlgorithm": false,
          "newAlgorithm": "خوارزمية جديدة"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        securityLevel: 'medium',
        threats: ['تحليل غير مكتمل'],
        recommendations: ['استخدم مفتاح أطول', 'غير الخوارزمية دورياً'],
        shouldChangeAlgorithm: false
      };
    } catch (error) {
      console.error('Error analyzing security:', error);
      throw new Error('فشل في تحليل الأمان');
    }
  }

  async detectPatterns(dataHistory: {
    encryptionTimes: number[];
    keySizes: number[];
    algorithms: string[];
    failures: number;
  }): Promise<{
    suspiciousActivity: boolean;
    patterns: string[];
    riskLevel: 'low' | 'medium' | 'high';
    actions: string[];
  }> {
    if (!this.model) {
      throw new Error('Gemini not initialized. Please provide API key.');
    }

    try {
      const prompt = `
        قم بتحليل أنماط استخدام التشفير للكشف عن التهديدات:
        
        أوقات التشفير: ${dataHistory.encryptionTimes.join(', ')} ملي ثانية
        أحجام المفاتيح: ${dataHistory.keySizes.join(', ')} بت
        الخوارزميات المستخدمة: ${dataHistory.algorithms.join(', ')}
        محاولات فاشلة: ${dataHistory.failures}
        
        ابحث عن:
        - أنماط غير طبيعية في التوقيت
        - تكرار مشبوه في الخوارزميات
        - محاولات فشل متكررة
        - تغييرات مفاجئة في السلوك
        
        أرجع النتيجة بصيغة JSON:
        {
          "suspiciousActivity": true/false,
          "patterns": ["قائمة الأنماط المكتشفة"],
          "riskLevel": "high",
          "actions": ["الإجراءات الموصى بها"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        suspiciousActivity: false,
        patterns: [],
        riskLevel: 'low',
        actions: []
      };
    } catch (error) {
      console.error('Error detecting patterns:', error);
      throw new Error('فشل في كشف الأنماط');
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

// Helper to store API key temporarily in session
export const setGeminiApiKey = (apiKey: string) => {
  sessionStorage.setItem('gemini_api_key', apiKey);
  geminiService.initialize(apiKey);
};

export const getGeminiApiKey = (): string | null => {
  return sessionStorage.getItem('gemini_api_key');
};

export const clearGeminiApiKey = () => {
  sessionStorage.removeItem('gemini_api_key');
};