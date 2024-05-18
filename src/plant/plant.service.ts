import { Injectable } from '@nestjs/common';

import { CreatePlantDto, UpdatePlantDto } from './dto';

import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.plant.findMany({
      include: {
        type: true,
        data: true,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.plant.findUnique({
      where: { id },
      include: {
        type: true,
        data: true,
      },
    });
  }

  async getMy(userId: string) {
    return this.prisma.plant.findMany({
      include: {
        type: true,
        data: true,
      },
      where: {
        userId,
      },
    });
  }

  async create(data: CreatePlantDto) {
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
    return this.prisma.$transaction(async (prisma) => {
      await prisma.data.deleteMany({
        where: { plantId: id },
      });
      return prisma.plant.delete({
        where: { id },
      });
    });
  }
}
