import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

import * as fs from 'fs';

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

    const fileName = `backup-${new Date().toISOString()}.csv`;

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
    if (!fs.existsSync(fileName)) {
      throw new NotFoundException(`Backup file ${fileName} not found`);
    }

    const csvData = [];
    fs.createReadStream(fileName)
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

        for (const row of csvData) {
          if (row.Email) {
            await this.prisma.user.create({
              data: {
                id: row.ID,
                email: row.Email,
                password: row.Password,
                provider: row.Provider,
                createdAt: new Date(row.CreatedAt),
                updatedAt: new Date(row.UpdatedAt),
                roles: row.Roles.split(',') as any,
                isBlocked: row.IsBlocked === 'true',
              },
            });
          } else if (row.PlantID) {
            await this.prisma.plant.create({
              data: {
                id: row.PlantID,
                name: row.Name,
                plantTypeId: row.PlantTypeID,
                userId: row.UserID,
                plantingDate: new Date(row.PlantingDate),
                currentStatus: row.CurrentStatus,
                soilType: row.SoilType,
              },
            });
          } else if (row.DataID) {
            await this.prisma.data.create({
              data: {
                id: row.DataID,
                humidity: parseFloat(row.Humidity),
                temperature: parseFloat(row.Temperature),
                light: parseFloat(row.Light),
                nutrientLevel: parseFloat(row.NutrientLevel),
                plantId: row.PlantDataID,
                timestamp: new Date(row.Timestamp),
              },
            });
          } else if (row.TypeName) {
            await this.prisma.plantType.create({
              data: {
                id: row.PlantTypeID,
                typeName: row.TypeName,
                description: row.Description,
                optimalHumidity: parseFloat(row.OptimalHumidity),
                optimalTemperature: parseFloat(row.OptimalTemperature),
                optimalLight: parseFloat(row.OptimalLight),
              },
            });
          } else if (row.Token) {
            await this.prisma.token.create({
              data: {
                token: row.Token,
                exp: new Date(row.Exp),
                userId: row.UserID,
                userAgent: row.UserAgent,
              },
            });
          }
        }
      })
      .on('error', (err) => {
        throw new InternalServerErrorException(`Error processing CSV file: ${err.message}`);
      });
  }
}
