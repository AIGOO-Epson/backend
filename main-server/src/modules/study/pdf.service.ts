import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { LearningSet } from '../translate/translate.definition';

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
