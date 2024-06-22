import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { LearningSet } from '../translate/translate.definition';
import * as SVGtoPDF from 'svg-to-pdfkit';

const arrowSvg = `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M280-280 80-480l200-200 56 56-103 104h494L624-624l56-56 200 200-200 200-56-56 103-104H233l103 104-56 56Z"/></svg>
`;

@Injectable()
export class PdfService {
  private assetPrefix = 'src/common/asset/';

  async generatePdf(learningSets: Map<string, LearningSet>): Promise<Buffer> {
    console.log(learningSets);
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        font: this.assetPrefix + 'font.ttf',
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
      let index = 1;
      for (const [key, value] of learningSets.entries()) {
        //대단원

        //대단원 인덱스
        doc
          .fillColor('red')
          .fontSize(10)
          .text(index + '  ', { continued: true });
        //대단원 이름
        doc
          .fillColor('black')
          .fontSize(18)
          .text(key + '  ', { align: 'left', continued: true });
        //번역
        doc
          .fillColor('#606060')
          .fontSize(14)
          .text(value.translation + '  ', doc.x, doc.y + 5, {
            align: 'left',
            continued: true,
          });
        //발음
        doc
          .fillColor('#606060')
          .fontSize(14)
          .text('[' + value.pronunciation + ']', {
            align: 'left',
            continued: false,
          });
        doc.fillColor('black');

        doc.moveDown(0.5);

        for (const [subKey, subValue] of Object.entries(value)) {
          //소단원
          if (subKey === 'translation' || subKey === 'pronunciation') {
            continue;
          }

          doc.fontSize(15).fillColor('#606060').text('| ', { continued: true });
          SVGtoPDF(doc, arrowSvg, doc.x + 10, doc.y + 4);
          doc
            .fillColor('black')
            .fontSize(15)
            .text(subKey, doc.x + 25, doc.y, { align: 'left' });
          doc.moveDown(0.2);

          //내용
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

        //대단원 마무리
        doc.moveDown(2);
        index += 1;
      }

      doc.end();
      doc.pipe(stream);
    });
  }
}
