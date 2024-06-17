//https://aiopen.etri.re.kr/guide/WiseNLU

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Environment } from '../../config/env/env.service';
import axios from 'axios';

interface MorpEval {
  id: number;
  result: string;
  target: string;
}

// const text =
// '주말에 가족들이랑 바닷가에 갔는데, 모래사장에서 축구도 하고 바비큐도 하면서 정말 행복한 시간을 보냈어. 날씨도 좋고 바람도 시원해서 완벽한 하루였지. 어젯밤에 친구들이랑 모여서 보드게임을 했는데, 한참 웃고 떠들다가 밤이 새는 줄도 몰랐어. 간만에 스트레스도 풀리고 정말 즐거운 시간이었어.';

@Injectable()
export class KoreanAnalyzeService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly API_KEY = Environment.get('KOREAN_ANALYZE_API_KEY');
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly API_REQUEST_URL =
    'http://aiopen.etri.re.kr:8000/WiseNLU_spoken';

  async analyzeKoreanText(data: {
    originText: string[];
    translatedText: string[];
  }): Promise<{ originText: string[]; translatedText: string[] }> {
    if (this.isEnglishList(data.originText)) {
      return {
        originText: data.originText,
        translatedText: await this.fetchMorpAnalysis(
          data.translatedText.join(' ')
        ),
      };
    }

    return {
      originText: await this.fetchMorpAnalysis(data.originText.join(' ')),
      translatedText: data.translatedText,
    };
  }

  private isEnglishList(textList) {
    const englishPattern = /^[\s!,.?A-Za-z]+$/;
    return englishPattern.test(textList[0]);
  }

  private processMorpResults(
    resultSentences: { morp_eval: MorpEval[] }[]
  ): string[] {
    return resultSentences.reduce((acc, current) => {
      const parsedSentence = this.processMorpSentence(current.morp_eval);
      return [...acc, parsedSentence];
    }, []);
  }

  private processMorpSentence(morpEvals: MorpEval[]): string {
    return morpEvals
      .reduce((acc, current: MorpEval) => {
        const { result, target } = current;

        if (result.includes('/NNG')) {
          return [...acc, this.applyHighlightToNouns(result, target)];
        }

        if (
          result.includes('/VV') ||
          result.includes('/VA') ||
          result.includes('/MAG')
        ) {
          return [...acc, this.applyHighlightToWords(target)];
        }

        return [...acc, target];
      }, [])
      .join(' ');
  }

  private applyHighlightToNouns(result: string, target: string): string {
    const nngWords = result
      .split('+')
      .filter((part) => part.includes('/NNG'))
      .map((part) => part.split('/')[0]);

    return nngWords.reduce((formattedTarget, word) => {
      return formattedTarget.replace(new RegExp(`(${word})`, 'g'), '*($1)*');
    }, target);
  }

  private applyHighlightToWords(target: string): string {
    return `*(${target})*`.replace(
      /\*\(([^()]*?)([^A-Za-z가-힣]*)\)\*/g,
      '*($1)*$2'
    );
  }

  private async fetchMorpAnalysis(text: string) {
    try {
      const response = await axios.post(
        this.API_REQUEST_URL,
        {
          argument: {
            analysis_code: 'morp',
            text,
          },
        },
        {
          headers: {
            Authorization: this.API_KEY,
          },
        }
      );

      const sentences = response.data.return_object.sentence;
      const parsedResult = this.processMorpResults(sentences);
      return parsedResult;
    } catch {
      throw new InternalServerErrorException(
        'Error while requesting morp analysis from AI API'
      );
    }
  }
}
