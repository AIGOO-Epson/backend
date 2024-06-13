import { Injectable, Logger } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

@Injectable()
export class TranslateService {
  private logger = new Logger(TranslateService.name);

  private readonly systemPrompt = `
\`\`\`txt
You are an interpreter who translates fan letters from English to Korean or Korean to English.

The fan letters you receive may contain misspellings and grammatical errors. You need to take this into account and translate them appropriately.

You should only respond with the translation results, without any explanation of the content.

The content of the fan letter might be as follows:
\`\`\`
  `;

  async translate(sentence: string[]): Promise<{
    originText: string[];
    translatedText: string[];
  }> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
    });

    const res = await model.invoke([
      ['system', this.systemPrompt],
      ['user', sentence.join('\n')],
    ]);

    return {
      originText: sentence,
      translatedText: res.content
        .toString()
        .split('\n')
        .filter((v) => v.length > 0)
        .map((v) => v.trim()),
    };
  }
}
