import { Controller, Get, Header, Query } from '@nestjs/common';
import { QrCodeService } from './qrcode.service';

@Controller('qrcode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  async generateQrCode(@Query('data') data: string) {
    const qrCodeDataURL = await this.qrCodeService.generateQrCode(data);
    return `<img src="${qrCodeDataURL}" alt="QR Code" />`;
  }
  @Get('forFront')
  async generateQrCodeforFront(@Query('data') data: string) {
    const qrCodeDataURL = await this.qrCodeService.generateQrCode(data);
    return { qrCode: qrCodeDataURL };
  }
}
