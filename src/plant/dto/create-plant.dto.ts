import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsDateString } from 'class-validator';

import { IsPlantTypeExists, IsUserExists } from '../../validators';

export class CreatePlantDto {
  @ApiProperty({ example: 'Fiddle Leaf Fig', description: 'The name of the plant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'uuid-of-plant-type', description: 'The ID of the plant type' })
  @IsUUID()
  @IsNotEmpty()
  @IsPlantTypeExists()
  plantTypeId: string;

  @ApiProperty({ example: 'uuid-of-user', description: 'The ID of the user' })
  @IsUUID()
  @IsNotEmpty()
  @IsUserExists()
  userId: string;

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'The planting date of the plant',
  })
  @IsDateString()
  @IsNotEmpty()
  plantingDate: string;

  @ApiProperty({ example: 'Healthy', description: 'The current status of the plant' })
  @IsString()
  @IsNotEmpty()
  currentStatus: string;

  @ApiProperty({ example: 'Loamy', description: 'The soil type of the plant' })
  @IsString()
  @IsNotEmpty()
  soilType: string;
}
