import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BackupDto {
  @ApiProperty({ example: 'backup-2022-01-01.csv', description: 'The name of the backup file' })
  @IsNotEmpty()
  @IsString()
  fileName: string;
}
