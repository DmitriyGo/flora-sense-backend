import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { v4 as uuidv4 } from 'uuid';

import * as fs from 'fs';
import * as path from 'path';

import { BackupDto } from './dto/backup.dto';

import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class BackupService {
  constructor(private prisma: PrismaService) {}

  async createBackup(): Promise<BackupDto> {
    const users = await this.prisma.user.findMany();
    const plants = await this.prisma.plant.findMany();
    const data = await this.prisma.data.findMany();
    const plantTypes = await this.prisma.plantType.findMany();
    const tokens = await this.prisma.token.findMany();

    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups');
    }

    const fileName = `backups/backup-${new Date().toISOString()}.csv`;

    const csvWriter = createObjectCsvWriter({
      path: fileName,
      header: [
        // User columns
        { id: 'id', title: 'ID' },
        { id: 'email', title: 'Email' },
        { id: 'password', title: 'Password' },
        { id: 'provider', title: 'Provider' },
        { id: 'createdAt', title: 'CreatedAt' },
        { id: 'updatedAt', title: 'UpdatedAt' },
        { id: 'roles', title: 'Roles' },
        { id: 'isBlocked', title: 'IsBlocked' },
        // Plant columns
        { id: 'plantId', title: 'PlantID' },
        { id: 'name', title: 'Name' },
        { id: 'plantTypeId', title: 'PlantTypeID' },
        { id: 'userId', title: 'UserID' },
        { id: 'plantingDate', title: 'PlantingDate' },
        { id: 'currentStatus', title: 'CurrentStatus' },
        { id: 'soilType', title: 'SoilType' },
        // Data columns
        { id: 'dataId', title: 'DataID' },
        { id: 'humidity', title: 'Humidity' },
        { id: 'temperature', title: 'Temperature' },
        { id: 'light', title: 'Light' },
        { id: 'nutrientLevel', title: 'NutrientLevel' },
        { id: 'plantDataId', title: 'PlantDataID' },
        { id: 'timestamp', title: 'Timestamp' },
        // PlantType columns
        { id: 'plantTypeId', title: 'PlantTypeID' },
        { id: 'typeName', title: 'TypeName' },
        { id: 'description', title: 'Description' },
        { id: 'optimalHumidity', title: 'OptimalHumidity' },
        { id: 'optimalTemperature', title: 'OptimalTemperature' },
        { id: 'optimalLight', title: 'OptimalLight' },
        // Token columns
        { id: 'tokenId', title: 'TokenID' },
        { id: 'token', title: 'Token' },
        { id: 'exp', title: 'Exp' },
        { id: 'tokenUserId', title: 'UserID' },
        { id: 'userAgent', title: 'UserAgent' },
      ],
    });

    const records = [
      ...users.map((user) => ({
        ...user,
        roles: user.roles.join(','),
      })),
      ...plants,
      ...data,
      ...plantTypes,
      ...tokens,
    ];

    await csvWriter.writeRecords(records);

    return { fileName };
  }

  async restoreBackup(fileName: string): Promise<void> {
    const filePath = path.resolve('backups', fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Backup file ${fileName} not found`);
    }

    const csvData = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', async () => {
        await this.prisma.token.deleteMany({});
        await this.prisma.data.deleteMany({});
        await this.prisma.plant.deleteMany({});
        await this.prisma.plantType.deleteMany({});
        await this.prisma.user.deleteMany({});

        const users = [];
        const plants = [];
        const data = [];
        const plantTypes = [];
        const tokens = [];

        for (const row of csvData) {
          if (row.Email) {
            users.push(row);
          } else if (row.PlantID) {
            plants.push(row);
          } else if (row.DataID) {
            data.push(row);
          } else if (row.TypeName) {
            plantTypes.push(row);
          } else if (row.Token) {
            tokens.push(row);
          }
        }

        console.log('users ==>', users);
        console.log('plants ==>', plants);
        console.log('data ==>', data);
        console.log('plantTypes ==>', plantTypes);
        console.log('tokens ==>', tokens);

        await Promise.all(
          users.map((user) =>
            this.prisma.user.create({
              data: {
                id: user.ID || uuidv4(),
                email: user.Email,
                password: user.Password,
                provider: user.Provider || null, // Set to null if empty
                createdAt: new Date(user.CreatedAt),
                updatedAt: new Date(user.UpdatedAt),
                roles: user.Roles.split(',') as any,
                isBlocked: user.IsBlocked === 'true',
              },
            }),
          ),
        );

        await Promise.all(
          plantTypes.map((plantType) =>
            this.prisma.plantType.create({
              data: {
                id: plantType.PlantTypeID || uuidv4(),
                typeName: plantType.TypeName,
                description: plantType.Description,
                optimalHumidity: parseFloat(plantType.OptimalHumidity),
                optimalTemperature: parseFloat(plantType.OptimalTemperature),
                optimalLight: parseFloat(plantType.OptimalLight),
              },
            }),
          ),
        );

        await Promise.all(
          plants.map((plant) =>
            this.prisma.plant.create({
              data: {
                id: plant.PlantID || uuidv4(),
                name: plant.Name,
                plantTypeId: plant.PlantTypeID || null,
                userId: plant.UserID || null,
                plantingDate: plant.PlantingDate ? new Date(plant.PlantingDate) : null,
                currentStatus: plant.CurrentStatus,
                soilType: plant.SoilType,
              },
            }),
          ),
        );

        await Promise.all(
          data.map((dataRow) =>
            this.prisma.data.create({
              data: {
                id: dataRow.DataID || uuidv4(),
                humidity: parseFloat(dataRow.Humidity),
                temperature: parseFloat(dataRow.Temperature),
                light: parseFloat(dataRow.Light),
                nutrientLevel: parseFloat(dataRow.NutrientLevel),
                plantId: dataRow.PlantDataID,
                timestamp: dataRow.Timestamp ? new Date(dataRow.Timestamp) : new Date(),
              },
            }),
          ),
        );

        await Promise.all(
          tokens.map((token) =>
            this.prisma.token.create({
              data: {
                token: token.Token,
                exp: new Date(token.Exp) || new Date(),
                userId: token.UserID,
                userAgent: token.UserAgent,
              },
            }),
          ),
        );
      })
      .on('error', (err) => {
        throw new InternalServerErrorException(`Error processing CSV file: ${err.message}`);
      });
  }
}
