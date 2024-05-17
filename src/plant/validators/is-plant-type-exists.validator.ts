import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

import { PrismaService } from '@prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPlantTypeExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(plantTypeId: string) {
    console.log('444');
    const plantType = await this.prisma.plantType.findUnique({ where: { id: plantTypeId } });
    console.log(651);
    return !!plantType;
  }

  defaultMessage() {
    return 'PlantType with ID $value does not exist';
  }
}

export function IsPlantTypeExists(validationOptions?: ValidationOptions) {
  console.log('12');
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPlantTypeExistsConstraint,
    });
  };
}
