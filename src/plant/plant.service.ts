import { Injectable, NotFoundException } from '@nestjs/common';

import { CreatePlantDto, UpdatePlantDto } from './dto';

import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.plant.findMany({
      include: {
        type: true,
        user: true,
        data: true,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.plant.findUnique({
      where: { id },
      include: {
        type: true,
        user: true,
        data: true,
      },
    });
  }
  async create(data: CreatePlantDto) {
    // Перевірка існування plantTypeId
    const plantType = await this.prisma.plantType.findUnique({ where: { id: data.plantTypeId } });
    if (!plantType) {
      throw new NotFoundException(`PlantType with ID ${data.plantTypeId} not found`);
    }
    console.log('plantType ==>', plantType);
    // Перевірка існування userId
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`);
    }

    return this.prisma.plant.create({
      data,
      include: {
        type: true,
        user: true,
        data: true,
      },
    });
  }

  async update(id: string, data: UpdatePlantDto) {
    return this.prisma.plant.update({
      where: { id },
      data,
      include: {
        type: true,
        user: true,
        data: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.plant.delete({ where: { id } });
  }
}
