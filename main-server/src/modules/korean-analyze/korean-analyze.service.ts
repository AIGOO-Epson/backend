//https://aiopen.etri.re.kr/guide/WiseNLU

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Environment } from '../../config/env/env.service';
import axios from 'axios';

interface MorpAnalysisResult {
  return_object: {
    sentence: {
      morp_eval: MorpEval[];
    }[];
  };
}

interface MorpEval {
  id: number;
  result: string;
  target: string;
}

@Injectable()
export class KoreanAnalyzeService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly API_KEY = Environment.get('KOREAN_ANALYZE_API_KEY');
  constructor() {
    // this.tst('y');
  }

  async tst(text2: string) {
    const text =
      '어젯밤에 친구들이랑 모여서 보드게임을 했는데,,, 한참 웃고 떠들다가 밤이 새는 줄도 몰랐어.';
    // '주말에 가족들이랑 바닷가에 갔는데, 모래사장에서 축구도 하고 바비큐도 하면서 정말 행복한 시간을 보냈어. 날씨도 좋고 바람도 시원해서 완벽한 하루였지. 어젯밤에 친구들이랑 모여서 보드게임을 했는데, 한참 웃고 떠들다가 밤이 새는 줄도 몰랐어. 간만에 스트레스도 풀리고 정말 즐거운 시간이었어.';
    const resultSentences: {
      morp_eval: MorpEval[];
    }[] = await this.requestToApi(text);

    const parsedResult = this.parseMorpResult(resultSentences);
    console.log(parsedResult);
  }

  private parseMorpResult(
    resultSentences: {
      morp_eval: MorpEval[];
    }[]
  ): string[][] {
    const finalResult: string[][] = resultSentences.reduce((acc, current) => {
      const morpEvals: MorpEval[] = current.morp_eval;

      const tmp = morpEvals.reduce((acc, current: MorpEval) => {
        const { result, target } = current;

        if (result.includes('/NNG')) {
          const formatted = result
            .replace(/(\S+\/NNG)/, (match, p1) => {
              // NNG가 붙은 단어만 추출해서 괄호로 감싼 후 리턴
              const word = p1.split('/')[0];
              return `(${word})`;
            })
            .replace(/\/\S+/g, '')
            .replace(/\+/g, '');

          return [...acc, formatted];
        }

        if (result.includes('/VV')) {
          console.log(result);
          return [
            ...acc,
            `(${target})`.replace(/\(([^()]*?)([^A-Za-z가-힣]*)\)/g, '($1)$2'),
          ];
        }

        return [...acc, target];
      }, []);

      return [...acc, tmp];
    }, []);

    return finalResult;
  }

  private requestToApi(text: string) {
    return axios
      .post(
        'http://aiopen.etri.re.kr:8000/WiseNLU_spoken',
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
      )
      .then((res: { data: MorpAnalysisResult }) => {
        const sentences = res.data.return_object.sentence;
        // sentences[0].morp_eval[0].result => 형태소 분석이 붙은 단어
        // target => 원본단어
        //매 result에서, 필요한 것만 하이라이트 처리해서 다 합쳐서 리턴
        //리듀스 쓰면 될듯

        return sentences;
      })
      .catch((_) => {
        throw new InternalServerErrorException('err while morp analyzing');
      });
  }
}
