//https://aiopen.etri.re.kr/guide/WiseNLU

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Environment } from '../../config/env/env.service';
import axios from 'axios';

interface MorpEval {
  id: number;
  result: string;
  target: string;
}

@Injectable()
export class KoreanAnalyzeService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly API_KEY = Environment.get('KOREAN_ANALYZE_API_KEY');
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly API_REQUEST_URL =
    'http://aiopen.etri.re.kr:8000/WiseNLU_spoken';

  constructor() {}

  async analyzeKoreanText(data: {
    originText: string[];
    translatedText: string[];
  }): Promise<{ originText: string[]; translatedText: string[] }> {
    if (data.originText.length !== data.translatedText.length) {
      throw new InternalServerErrorException(
        'translated length does not match with origin length, at korean-analyze.service.ts'
      );
    }

    if (this.isEnglishList(data.originText)) {
      return {
        originText: data.originText,
        translatedText: await this.fetchMorpAnalysis(data.translatedText),
      };
    }

    return {
      originText: await this.fetchMorpAnalysis(data.originText),
      translatedText: data.translatedText,
    };
  }

  private isEnglishList(textList) {
    const englishPattern = /^[\d\s!"#$%&'()*+,./:;<=>?@A-Za-z\-]+$/;
    return englishPattern.test(textList[0]);
  }

  private processMorpResults(resultSentences: { morp_eval: MorpEval[] }[]): {
    separated: string[];
    highlighted: string[];
  } {
    return resultSentences.reduce(
      (acc, current) => {
        const { separatedSentence, highlightedSentence } =
          this.processMorpSentence(current.morp_eval);
        return {
          separated: [...acc.separated, separatedSentence],
          highlighted: [...acc.highlighted, highlightedSentence],
        };
      },
      { separated: [], highlighted: [] }
    );
  }

  private processMorpSentence(morpEvals: MorpEval[]): {
    separatedSentence: string;
    highlightedSentence: string;
  } {
    const highlightedSentence = morpEvals
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

    const separatedSentence = morpEvals
      .reduce((acc, current: MorpEval) => {
        const { target } = current;
        return [...acc, target];
      }, [])
      .join(' ');

    return { separatedSentence, highlightedSentence };
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

  private async fetchMorpAnalysis(beforeMorpTextList: string[]) {
    try {
      const response = await axios.post(
        this.API_REQUEST_URL,
        {
          argument: {
            analysis_code: 'morp',
            text: beforeMorpTextList.join(' '),
          },
        },
        {
          headers: {
            Authorization: this.API_KEY,
          },
        }
      );

      const sentences = response.data.return_object.sentence;
      const { separated, highlighted } = this.processMorpResults(sentences);
      console.log(beforeMorpTextList, separated);

      //이제 separated와 highlighted와 origin이 준비됨.
      const final = Array.from(
        { length: beforeMorpTextList.length },
        (_, index) => {
          // console.log(separated[index].length);
          // console.log(beforeMorpTextList[index].length);
          //일단, 원래문장[index]랑 separated[index]랑 동일한 문장이면
          //.length도 똑같이 되게 만들어놨음.
          //.length가 다르다? 다른문장이라고 판단하고,
          //separated[index].length + separated[index+1].length 를 하면 맞는지 체크
          //이런식으로 해서 return highlighted[index] + highlighted[index+1] + highlighted[index+2]
          //이렇게 해서 final을 채워나가면
          //final과 before의 각 원소의 문장구성을 동일하게 만들수 있지 않을까 라는 생각임.
        }
      );

      return highlighted;
    } catch {
      throw new InternalServerErrorException(
        'Error while requesting morp analysis from AI API'
      );
    }
  }
}
