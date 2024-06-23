import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { LearningSet } from '../translate/translate.definition';
import * as SVGtoPDF from 'svg-to-pdfkit';

const svgColor = '#EA3323'; //red
// const svgColor = '#606060';

const arrowSvg = `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${svgColor}"><path d="M280-280 80-480l200-200 56 56-103 104h494L624-624l56-56 200 200-200 200-56-56 103-104H233l103 104-56 56Z"/></svg>`;

const warnSvg = `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${svgColor}"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>`;

const equalSvg = `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${svgColor}"><path d="M160-280v-120h640v120H160Zm0-280v-120h640v120H160Z"/></svg>`;

const exerciseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${svgColor}"><path d="M167-120q-21 5-36.5-10.5T120-167l40-191 198 198-191 40Zm191-40L160-358l458-458q23-23 57-23t57 23l84 84q23 23 23 57t-23 57L358-160Zm317-600L261-346l85 85 414-414-85-85Z"/></svg>`;

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
          .fontSize(12)
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
          .font(this.assetPrefix + 'segoeuithis.ttf')
          .fillColor('#606060')
          .fontSize(14)
          .text(
            value.pronunciation
              .replace(/\//g, '')
              .replace(/^/, '[')
              .replace(/$/, ']'),
            {
              align: 'left',
              continued: false,
            }
          );
        doc.font(this.assetPrefix + 'font.ttf').fillColor('black');

        //대단원 제목과 소단원 사이의 여백
        doc.moveDown(0.5);

        for (const [subKey, subValue] of Object.entries(value)) {
          //소단원

          if (subValue === null) {
            continue;
          }

          switch (subKey) {
            case 'translation':
              continue;

            case 'pronunciation':
              continue;

            case 'synonyms':
              doc
                .fontSize(15)
                .fillColor('#606060')
                .text('| ', { continued: true });
              SVGtoPDF(doc, equalSvg, doc.x + 10, doc.y + 4);
              doc
                .fillColor('black')
                .fontSize(15)
                .text(subKey, doc.x + 25, doc.y, { align: 'left' });
              break;

            case 'antonyms':
              doc
                .fontSize(15)
                .fillColor('#606060')
                .text('| ', { continued: true });
              SVGtoPDF(doc, arrowSvg, doc.x + 10, doc.y + 4);
              doc
                .fillColor('black')
                .fontSize(15)
                .text(subKey, doc.x + 25, doc.y, { align: 'left' });
              break;

            case 'caution':
              doc
                .fontSize(15)
                .fillColor('#606060')
                .text('| ', { continued: true });
              SVGtoPDF(doc, warnSvg, doc.x + 10, doc.y + 4);
              doc
                .fillColor('black')
                .fontSize(15)
                .text(subKey, doc.x + 25, doc.y, { align: 'left' });
              break;

            case 'exercises':
              doc
                .fontSize(15)
                .fillColor('#606060')
                .text('| ', { continued: true });
              SVGtoPDF(doc, exerciseSvg, doc.x + 10, doc.y + 4);
              doc
                .fillColor('black')
                .fontSize(15)
                .text(subKey, doc.x + 25, doc.y, { align: 'left' });
              break;
          }
          //소단원 제목과 내용 사이의 여백
          doc.moveDown(0.2);

          //내용

          if (Array.isArray(subValue)) {
            for (const [index, item] of subValue.entries()) {
              const parts = item.split(/\. |\(|\.\)/).filter(Boolean);
              doc.fontSize(12).text(`${index + 1}. ${parts[0]}`, {
                align: 'left',
                indent: 3,
              });
              doc.fontSize(12).text(parts[1], { align: 'left', indent: 5 });
            }
          } else {
            doc
              .fontSize(12)
              .text(subValue as string, { align: 'left', indent: 3 });
          }
          //소단원 끼리의 여백
          doc.moveDown(0.6);
        }

        //대단원끼리의 여백
        doc.moveDown(2);
        index += 1;
      }

      doc.end();
      doc.pipe(stream);
    });
  }
}
