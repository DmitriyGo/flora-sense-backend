import { Injectable } from '@nestjs/common';

import { CreatePlantDataDto, UpdatePlantDataDto } from './dto';

import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PlantDataService {
  constructor(private prisma: PrismaService) {}

  async getAllByPlant(plantId: string) {
    return this.prisma.data.findMany({ where: { plantId } });
  }

  async getById(id: string) {
    return this.prisma.data.findUnique({ where: { id } });
  }

  async create(data: CreatePlantDataDto) {
    return this.prisma.data.create({ data });
  }

  async update(id: string, data: UpdatePlantDataDto) {
    return this.prisma.data.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.data.delete({ where: { id } });
  }
}
