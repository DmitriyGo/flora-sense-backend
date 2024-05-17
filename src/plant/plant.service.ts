import { Injectable } from '@nestjs/common';

import { CreatePlantDto, UpdatePlantDto } from './dto';

import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.plant.findMany();
  }

  async getById(id: string) {
    return this.prisma.plant.findUnique({ where: { id } });
  }

  async create(data: CreatePlantDto) {
    return this.prisma.plant.create({ data });
  }

  async update(id: string, data: UpdatePlantDto) {
    return this.prisma.plant.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.plant.delete({ where: { id } });
  }
}
