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
import { SystemPrompts } from './translate.prompt';
// import Zod from 'zod';

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

@Injectable()
export class TranslateService {
  private logger = new Logger(TranslateService.name);

  // 이미지 파일 URL을 받아, OCR로 텍스트를 추출하고, 오타 교정 및 번역을 실행합니다.
  async run(data: { buffer: Buffer; mimetype: string }): Promise<{
    originText: string[];
    translatedText: string[];
  }> {
    // 1. 이미지 파일이 저장된 URL 처리
    const ext = data.mimetype.split('/').pop();

    // 1-1. 확장자 체크: JPG 또는 PDF만 지원되게 함
    if (!ext || !this.isAllowExtension(ext)) {
      this.logger.error(`Invalid file type. ext: ${ext}`);
      throw new Error('Invalid file type. allowed: jpg, pdf');
    }

    // 2. OCR로 스캔된 텍스트를 가져옴
    const pred = await this.getTextFromFile(data.buffer, ext);

    // 3. OCR한 문장 배열을 오타 수정, 번역
    const typofixed = (await this.fixTypo(pred))
      .map((v) => v.split('.'))
      .flat()
      .filter((v) => v.length > 0)
      .map((v) => v.trim() + '.');
    const translated = await this.translate(typofixed);

    this.logger.debug('pred length: ' + pred.length);
    this.logger.debug('originalText length: ' + typofixed.length);
    this.logger.debug('translatedText length: ' + translated.length);

    return { originText: typofixed, translatedText: translated };
  }

  // LLM을 사용해 문장 배열에 대한 번역을 실행합니다.
  async translate(sentences: string[]): Promise<string[]> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    let input: [string, string][] = [['system', SystemPrompts.translate]];

    for await (const sentence of sentences) {
      if (sentence.trim().length === 0) continue;
      this.logger.debug(`translating: ${sentence}`);

      input.push(['user', sentence]);
      const pred = await model.invoke(input);
      input.push(['assistant', pred.content.toString().trim()]);
    }

    return input.filter((v) => v[0] === 'assistant').map((v) => v[1]);
  }

  // LLM을 사용해 문장 배열에 대한 오타 교정을 실행합니다.
  async fixTypo(sentences: string[]): Promise<string[]> {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      safetySettings: GlobalSafetySettings,
    });

    let input: [string, string][] = [['system', SystemPrompts.fixtypo]];

    for await (const sentence of sentences) {
      if (sentence.trim().length === 0) continue;
      this.logger.debug(`Typo fixing: ${sentence}`);

      input.push(['user', sentence]);
      const pred = await model.invoke(input);
      input.push(['assistant', pred.content.toString().trim()]);
    }

    return input.filter((v) => v[0] === 'assistant').map((v) => v[1]);
  }

  // 네이버 OCR API를 사용해 이미지 파일로부터 텍스트를 추출합니다.
  async getTextFromFile(buffer: Buffer, filetype: string): Promise<string[]> {
    // 1. 네이버 OCR API로 이미지 파일을 텍스트로 변환
    //https://api.ncloud-docs.com/docs/ai-application-service-ocr-ocr
    const res = await axios.post(
      Environment.get('NAVER_OCR_URL'),
      {
        images: [
          {
            format: filetype,
            name: 'medium',
            data: buffer.toString('base64'),
            url: null,
          },
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

  isAllowExtension(ext: string): boolean {
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'pdf':
        return true;
      default:
        return false;
    }
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
      ['user', '참았던, 심심한, 모른, 구른, 같이'],
      ['assistant', '참다, 심심하다, 모르다, 구르다, 같다'],
      ['user', words.join(', ')],
    ]);

    return pred.content
      .toString()
      .split(', ')
      .map((v) => v.trim().replaceAll('\n', ''));
  }
}
