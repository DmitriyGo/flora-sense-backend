import { Controller, Post, Get, Param, Body, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

import * as fs from 'fs';
import * as path from 'path';

import { BackupService } from './backup.service';
import { BackupDto } from './dto/backup.dto';

@ApiTags('backup')
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @ApiOperation({ summary: 'Create a backup' })
  @Post()
  async createBackup() {
    return this.backupService.createBackup();
  }

  @ApiOperation({ summary: 'Restore a backup' })
  @ApiBody({ type: BackupDto })
  @Post('restore')
  async restoreBackup(@Body() backupDto: BackupDto) {
    return this.backupService.restoreBackup(backupDto.fileName);
  }

  @ApiOperation({ summary: 'Download a backup' })
  @ApiParam({ name: 'fileName', required: true, description: 'The name of the backup file' })
  @Get('download/:fileName')
  async downloadBackup(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = path.resolve(fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Backup file ${fileName} not found`);
    }

    res.download(filePath);
  }
}
