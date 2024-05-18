import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { BackupService } from './backup.service';
import { BackupDto } from './dto/backup.dto';

@ApiBearerAuth()
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

  //   @ApiOperation({ summary: 'Download a backup' })
  //   @ApiParam({ name: 'folderName', required: true, description: 'The name of the backup folder' })
  //   @Get('download/:folderName')
  //   async downloadBackup(@Param('folderName') folderName: string, @Res() res: Response) {
  //     const folderPath = path.resolve('backups', folderName);

  //     if (!fs.existsSync(folderPath)) {
  //       throw new NotFoundException(`Backup folder ${folderName} not found`);
  //     }

  //     const zipFilePath = `${folderPath}.zip`;

  //     // Create a zip file of the backup folder
  //     const output = fs.createWriteStream(zipFilePath);

  //     output.on('close', () => {
  //       res.download(zipFilePath);
  //     });
  //   }
}
