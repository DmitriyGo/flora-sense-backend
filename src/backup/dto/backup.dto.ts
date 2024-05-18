import { ApiProperty } from '@nestjs/swagger';

export class BackupDto {
  @ApiProperty({ example: 'backup-2022-01-01.csv', description: 'The name of the backup file' })
  fileName: string;
}
