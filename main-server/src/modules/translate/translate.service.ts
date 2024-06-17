import { Injectable, Logger } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import axios from 'axios';
import {
  HarmBlockThreshold,
  HarmCategory,
  LearningSet,
  SafetySetting,
} from './translate.definition';
import { Environment } from 'src/config/env/env.service';
import { parse } from 'yaml';

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

  learningSet: `
\`\`\`txt
You are a Korean teacher who teaches Korean to English-speaking students.

Given a set of Korean words, you need to provide the following information in "English".

* English translation of the word
* Synonyms
* Antonyms
* Pronunciation symbols
* Exercises
* Cautions when using the word
\`\`\`

The result must be returned in yaml, and must have the following format (the key must not vary):

\`\`\`yaml
translation: bed
synonyms: 침상, 잠자리
antonyms: 의자, 책상
pronunciation: /t͡ʃim.de/
exercises: 
- "Describe your ideal bedroom. (당신의 이상적인 침실에 대해 설명하세요.)"
- "Write a sentence using '침대' to describe where you sleep. ('침대'를 사용하여 잠자는 장소를 설명하는 문장을 작성하세요.)"
caution: "'침대' is a common word for 'bed' and is used in most situations."
\`\`\`

They are separated by commas and return only the response to each item given above without any explanation.

You should also use Markdown code blocks to "separate" the word information.

The following are the given Korean words:
`,
  PrincipalParts: `
\`\`\`txt
You are a Korean teacher.

Given a Korean word, convert it to its "principal parts (기본형)" form as defined in Korean.

Return only the results in order, with no explanation.
\`\`\`

\`\`\`txt
Here's an example:

input: 했는데, 웃고, 밤, 모여서
output: 하다, 웃다, 밤, 모이다
\`\`\`
`,
};

@Injectable()
export class TranslateService {
  private logger = new Logger(TranslateService.name);

  // 이미지 파일 URL을 받아, OCR로 텍스트를 추출하고, 오타 교정 및 번역을 실행합니다.
  async run(uploaded: string): Promise<{
    originText: string[];
    translatedText: string[];
  }> {
    // 1. 이미지 파일이 저장된 URL 처리
    const fileUrl = new URL(uploaded);
    const ext = fileUrl.pathname.split('.').pop();

    // 1-1. 확장자 체크: JPG 또는 PDF만 지원되게 함
    if (ext !== 'jpg' && ext !== 'pdf') {
      this.logger.error(`Invalid file type. ext: ${ext}`);
      throw new Error('Invalid file type. allowed: jpg, pdf');
    }

    // 2. OCR로 스캔된 텍스트를 가져옴
    const pred = await this.getTextFromFile(fileUrl, ext);

    // 3. OCR한 문장 배열을 오타 수정, 번역
    const typofixed = await this.fixTypo(pred);
    const translated = await this.translate(typofixed);

    return { originText: typofixed, translatedText: translated };
  }

  // LLM을 사용해 문장 배열에 대한 번역을 실행합니다.
  async translate(sentence: string[]): Promise<string[]> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    // 번역 모델에 문장 배열을 전달
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

  // LLM을 사용해 문장 배열에 대한 오타 교정을 실행합니다.
  async fixTypo(sentence: string[]): Promise<string[]> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    // 오타 교정 모델에 문장 배열을 전달
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

  // 네이버 OCR API를 사용해 이미지 파일로부터 텍스트를 추출합니다.
  async getTextFromFile(
    uploaded: URL,
    filetype: 'jpg' | 'pdf'
  ): Promise<string[]> {
    // 1. 네이버 OCR API로 이미지 파일을 텍스트로 변환
    const res = await axios.post(
      Environment.get('NAVER_OCR_URL'),
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
          'X-OCR-SECRET': Environment.get('NAVER_OCR_SECRET'),
          /* eslint-enable no-alert, @typescript-eslint/naming-convention */
        },
      }
    );

    const preds: {
      valueType: string;
      boundingPoly: unknown;
      inferText: string;
      inferConfidence: number;
    }[] = res.data.images[0].fields; // OCR API측 반환 값 기반으로 interface duck-typing

    const sentence: string[] = [''];

    // 2. OCR 결과를 문장 단위로 나눔
    //    문장 끊기는 '.'을 기준으로 함.
    for (const word of preds) {
      const dotIndex = word.inferText.indexOf('.');
      if (dotIndex == -1) {
        // 2-1. '.'이 없는 경우, 단어를 기존 문장에 그대로 추가 (append)
        sentence[sentence.length - 1] += word.inferText + ' ';
      } else {
        // 2-2. '.'이 있는 경우, '.'을 기준으로 문장을 나누고,
        //      새로운 문장을 만들어, 그 다음 단어를 추가 (push)
        sentence[sentence.length - 1] += word.inferText.slice(0, dotIndex + 1);
        sentence.push(word.inferText.slice(dotIndex + 1));
      }
    }

    this.logger.verbose(sentence);

    return sentence;
  }

  async genLearningSet(words: string[]): Promise<Map<string, LearningSet>> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    const preds = new Map<string, LearningSet>();

    for await (const word of words) {
      this.logger.debug(`Generating learning set for ${word}...`);
      const pred = await model.invoke([
        ['system', SystemPrompts.learningSet],
        ['user', word],
      ]);

      // remove markdown code block
      const parsed = parse(
        pred.content.toString().replaceAll('```yaml', '').replaceAll('```', '')
      );

      // type check for parsed
      const isVaild = this.isVaildLearningSet(parsed);
      if (!isVaild) {
        this.logger.error(`Invalid learning set: ${word}`);
        console.dir(parsed);
        continue;
      }

      preds.set(word, parsed as LearningSet);
    }

    return preds;
  }

  isVaildLearningSet(parsed: any): boolean {
    let isVaild = typeof parsed === 'object';

    isVaild =
      isVaild &&
      parsed.hasOwnProperty('translation') &&
      typeof parsed.translation === 'string';

    // 유의어, 반의어, 주의사항은 없을 수 있음을 감안하여 상세 타입 체크 제외
    isVaild = isVaild && parsed.hasOwnProperty('synonyms');

    isVaild = isVaild && parsed.hasOwnProperty('antonyms');

    isVaild = isVaild && parsed.hasOwnProperty('caution');

    isVaild =
      isVaild &&
      parsed.hasOwnProperty('pronunciation') &&
      typeof parsed.pronunciation === 'string';

    isVaild =
      isVaild &&
      parsed.hasOwnProperty('exercises') &&
      Array.isArray(parsed.exercises);

    return isVaild;
  }

  // 주어진 단어에 대해 순서대로 기본형으로 변환합니다.
  async getPrincipalParts(words: string[]): Promise<string[]> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    const pred = await model.invoke([
      ['system', SystemPrompts.PrincipalParts],
      ['user', '참았던, 심심한, 모른'],
      ['assistant', '참다, 심심하다, 모르다'],
      ['user', words.join(', ')],
    ]);

    return pred.content
      .toString()
      .split(', ')
      .map((v) => v.trim().replaceAll('\n', ''));
  }
}
