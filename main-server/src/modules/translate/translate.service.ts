import { Injectable, Logger } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import axios from 'axios';
import {
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting,
} from './translate.definition';

// eslint-disable-next-line @typescript-eslint/naming-convention
const GlobalSafetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// eslint-disable-next-line @typescript-eslint/naming-convention
const SystemPrompts = {
  translate: `
\`\`\`txt
You are an interpreter who translates fan letters from English to Korean or Korean to English.

The fan letters you receive may contain misspellings and grammatical errors. You need to take this into account and translate them appropriately.

Also, the translated fan letter will be forwarded to the artist, so it should be translated in a more friendly tone.

If the fan letter contains slang or profanity, translate it with the appropriate meaning.

You should only respond with the translation results, without any explanation of the content.

The content of the fan letter might be as follows:
\`\`\`
`,

  fixtypo: `
\`\`\`txt
You are a stenographer who corrects typos and replaces misrepresented letters in fan letters.

You will receive as input scanned sentences that have been OCR'd from images.

Your task is to fix the typos with the intended words, while maintaining the structure of the sentence.

Respond only with the converted result, without any explanation of the content.
\`\`\`
`,
};

@Injectable()
export class TranslateService {
  private logger = new Logger(TranslateService.name);

  async run(uploaded: string): Promise<{
    originText: string[];
    translatedText: string[];
  }> {
    const fileUrl = new URL(uploaded);
    const ext = fileUrl.pathname.split('.').pop();

    if (ext !== 'jpg' && ext !== 'pdf') {
      this.logger.error(`Invalid file type. ext: ${ext}`);
      throw new Error('Invalid file type. allowed: jpg, pdf');
    }

    const pred = await this.getTextFromFile(fileUrl, ext);

    const fixed = await this.fixTypo(pred);
    const translated = await this.translate(fixed);

    return { originText: fixed, translatedText: translated };
  }

  async translate(sentence: string[]): Promise<string[]> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    const pred = await model.invoke([
      ['system', SystemPrompts.translate],
      ['user', sentence.join('\n')],
    ]);

    return pred.content
      .toString()
      .split('\n')
      .filter((v) => v.length > 0)
      .map((v) => v.trim());
  }

  async fixTypo(sentence: string[]): Promise<string[]> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    const pred = await model.invoke([
      ['system', SystemPrompts.fixtypo],
      ['user', sentence.join('\n')],
    ]);

    return pred.content
      .toString()
      .split('\n')
      .filter((v) => v.length > 0)
      .map((v) => v.trim());
  }

  async getTextFromFile(
    uploaded: URL,
    filetype: 'jpg' | 'pdf'
  ): Promise<string[]> {
    const res = await axios.post(
      'https://0as2n5rklw.apigw.ntruss.com/custom/v1/31572/1b909269c6d1436ba0a7129edaf4419bd0267e79cb96c14b2620bdf4774e086e/general',
      {
        images: [
          { format: filetype, name: 'medium', data: null, url: uploaded.href },
        ],
        lang: 'ko',
        requestId: 'string',
        resultType: 'string',
        timestamp: Date.now(),
        version: 'V1',
      },
      {
        headers: {
          /* eslint-disable no-alert, @typescript-eslint/naming-convention */
          'Content-Type': 'application/json',
          'X-OCR-SECRET': process.env.NAVER_OCR_SECRET,
          /* eslint-enable no-alert, @typescript-eslint/naming-convention */
        },
      }
    );

    const preds: {
      valueType: string;
      boundingPoly: unknown;
      inferText: string;
      inferConfidence: number;
    }[] = res.data.images[0].fields;

    const sentence: string[] = [''];

    for (const word of preds) {
      const dotIndex = word.inferText.indexOf('.');
      if (dotIndex == -1) {
        sentence[sentence.length - 1] += word.inferText + ' ';
      } else {
        sentence[sentence.length - 1] += word.inferText.slice(0, dotIndex + 1);
        sentence.push(word.inferText.slice(dotIndex + 1));
      }
    }

    this.logger.verbose(sentence);

    return sentence;
  }
}
