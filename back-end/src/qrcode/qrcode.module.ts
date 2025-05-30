import { Module } from '@nestjs/common';
import { QrCodeController } from './qrcode.controller';
import { QrCodeService } from './qrcode.service';

@Module({
  controllers: [QrCodeController],
  providers: [QrCodeService],
})
export class QrCodeModule {}
