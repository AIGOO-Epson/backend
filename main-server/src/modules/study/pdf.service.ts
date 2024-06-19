import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { LearningSet } from '../translate/translate.definition';

const sampleLearningSets: Map<string, LearningSet> = new Map([
  [
    '사랑',
    {
      translation: 'love',
      synonyms: '애정, 연애',
      antonyms: '미움, 증오',
      pronunciation: 'sa-rang',
      exercises: [
        '사랑의 반의어는 무엇인가요?',
        '사랑을 영어로 어떻게 표현하나요?',
        '사랑과 애정의 차이점을 설명해보세요.',
      ],
      caution:
        '사랑이라는 단어는 문맥에 따라 다양한 의미로 사용될 수 있습니다.',
    },
  ],
  [
    '행복',
    {
      translation: 'happiness',
      synonyms: '기쁨, 즐거움',
      antonyms: '슬픔, 불행',
      pronunciation: 'haeng-bok',
      exercises: [
        '행복의 유의어는 무엇인가요?',
        '행복을 영어로 어떻게 표현하나요?',
        '행복과 슬픔을 대조하여 설명해보세요.',
      ],
      caution: '행복의 기준은 사람마다 다를 수 있습니다.',
    },
  ],
  [
    '용기',
    {
      translation: 'courage',
      synonyms: '용맹, 담력',
      antonyms: '겁, 비겁',
      pronunciation: 'yong-gi',
      exercises: [
        '용기의 반의어는 무엇인가요?',
        '용기를 영어로 어떻게 표현하나요?',
        '용기와 비겁의 차이점을 설명해보세요.',
      ],
      caution: '용기는 무모함과 혼동될 수 있습니다.',
    },
  ],
  [
    '지혜',
    {
      translation: 'wisdom',
      synonyms: '지식, 슬기',
      antonyms: '무지, 어리석음',
      pronunciation: 'ji-hye',
      exercises: [
        '지혜의 유의어는 무엇인가요?',
        '지혜를 영어로 어떻게 표현하나요?',
        '지혜와 무지의 차이점을 설명해보세요.',
      ],
      caution: '지혜는 경험을 통해 얻어지는 경우가 많습니다.',
    },
  ],
]);

@Injectable()
export class PdfService {
  async generatePdf(learningSets: Map<string, LearningSet>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        font: 'src/common/asset/font.ttf',
      });

      const buffers = [];
      const stream = new PassThrough();
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      //pdf 작성 부분
      for (const [key, value] of learningSets.entries()) {
        doc.fontSize(22).text(key, { align: 'left' });
        doc.moveDown(0.5);

        for (const [subKey, subValue] of Object.entries(value)) {
          doc.fontSize(16).text(`• ${subKey}`, { align: 'left' });
          doc.moveDown(0.2);

          if (Array.isArray(subValue)) {
            for (const item of subValue) {
              doc.fontSize(12).text(`- ${item}`, { align: 'left', indent: 20 });
              doc.moveDown(0.1);
            }
          } else {
            doc
              .fontSize(12)
              .text(subValue as string, { align: 'left', indent: 20 });
            doc.moveDown(0.2);
          }
        }
        doc.moveDown(2);
      }

      doc.end();
      doc.pipe(stream);
    });
  }
}
