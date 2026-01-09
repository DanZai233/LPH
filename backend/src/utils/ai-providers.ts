import { AIConfig, AIProvider } from '../types';

export interface AIResponse {
  text: string;
  error?: string;
}

export interface AIPromptOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class AIProviderAdapter {
  constructor(private config: AIConfig) {}

  async generateText(prompt: string, options?: AIPromptOptions): Promise<AIResponse> {
    switch (this.config.provider) {
      case AIProvider.GEMINI:
        return this.callGemini(prompt, options);
      case AIProvider.OPENAI:
        return this.callOpenAI(prompt, options);
      case AIProvider.OPENROUTER:
        return this.callOpenRouter(prompt, options);
      case AIProvider.VOLCENGINE:
        return this.callVolcEngine(prompt, options);
      case AIProvider.ANTHROPIC:
        return this.callAnthropic(prompt, options);
      default:
        return { text: '', error: `Unsupported provider: ${this.config.provider}` };
    }
  }

  async generateJSON(prompt: string, schema?: any, options?: AIPromptOptions): Promise<any> {
    const jsonPrompt = `${prompt}\n\nPlease respond with valid JSON only, no markdown formatting.`;
    const response = await this.generateText(jsonPrompt, options);
    
    if (response.error) {
      return null;
    }

    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                       response.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(response.text);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return null;
    }
  }

  private async callGemini(prompt: string, options?: AIPromptOptions): Promise<AIResponse> {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.config.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: this.config.model || 'gemini-1.5-flash',
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 2048,
        }
      });

      const fullPrompt = options?.systemPrompt 
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return { text: response.text() };
    } catch (error: any) {
      return { text: '', error: error.message || 'Gemini API error' };
    }
  }

  private async callOpenAI(prompt: string, options?: AIPromptOptions): Promise<AIResponse> {
    try {
      const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
      const model = this.config.model || 'gpt-3.5-turbo';

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { text: '', error: error.error?.message || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { text: data.choices[0]?.message?.content || '' };
    } catch (error: any) {
      return { text: '', error: error.message || 'OpenAI API error' };
    }
  }

  private async callOpenRouter(prompt: string, options?: AIPromptOptions): Promise<AIResponse> {
    try {
      const baseUrl = this.config.baseUrl || 'https://openrouter.ai/api/v1';
      const model = this.config.model || 'openai/gpt-3.5-turbo';

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.config?.httpReferer || 'http://localhost:5173',
          'X-Title': this.config.config?.appName || 'Linux Package Hub',
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { text: '', error: error.error?.message || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { text: data.choices[0]?.message?.content || '' };
    } catch (error: any) {
      return { text: '', error: error.message || 'OpenRouter API error' };
    }
  }

  private async callVolcEngine(prompt: string, options?: AIPromptOptions): Promise<AIResponse> {
    try {
      // 火山引擎 API（根据实际API文档调整）
      const baseUrl = this.config.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3';
      const model = this.config.model || 'ep-xxx'; // 需要实际的 endpoint ID

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { text: '', error: error.error?.message || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { text: data.choices[0]?.message?.content || '' };
    } catch (error: any) {
      return { text: '', error: error.message || 'VolcEngine API error' };
    }
  }

  private async callAnthropic(prompt: string, options?: AIPromptOptions): Promise<AIResponse> {
    try {
      const baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1';
      const model = this.config.model || 'claude-3-haiku-20240307';

      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens || 2048,
          temperature: options?.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: options?.systemPrompt 
                ? `${options.systemPrompt}\n\n${prompt}`
                : prompt
            }
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { text: '', error: error.error?.message || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { text: data.content[0]?.text || '' };
    } catch (error: any) {
      return { text: '', error: error.message || 'Anthropic API error' };
    }
  }
}

