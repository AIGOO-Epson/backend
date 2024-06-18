import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { LearningSet } from '../translate/translate.definition';

@Injectable()
export class PdfService {
  async generatePdf(
    learningSet: Map<string, LearningSet>,
    lines: string[]
  ): Promise<Buffer> {
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
      for (const [index, text] of lines.entries()) {
        if (/^\d+\./.test(text)) {
          doc.fontSize(20);
        } else {
          doc.fontSize(12);
        }

        doc.text(text, { align: 'left' });

        if (index < lines.length - 1) {
          doc.moveDown();
        }

        doc.fontSize(12);
        doc.fillColor('black');
      }

      doc.end();
      doc.pipe(stream);
    });
  }

  async generatePdf2(lines: string[]): Promise<Buffer> {
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
      for (const [index, text] of lines.entries()) {
        if (/^\d+\./.test(text)) {
          doc.fontSize(20);
        } else {
          doc.fontSize(12);
        }

        doc.text(text, { align: 'left' });

        if (index < lines.length - 1) {
          doc.moveDown();
        }

        doc.fontSize(12);
        doc.fillColor('black');
      }

      doc.end();
      doc.pipe(stream);
    });
  }
}
