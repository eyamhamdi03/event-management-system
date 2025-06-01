import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQrCode(data: string): Promise<string> {
    try {
      const qrCodeDataURL = await qrcode.toDataURL(data);
      return qrCodeDataURL;
    } catch (error: any) {
      console.error('Failed to generate QR code:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }
}
