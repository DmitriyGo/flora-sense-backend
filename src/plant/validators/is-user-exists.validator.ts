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
export class IsUserExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return !!user;
  }

  defaultMessage() {
    return 'User with ID $value does not exist';
  }
}

export function IsUserExists(validationOptions?: ValidationOptions) {
  console.log('asdasd');
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserExistsConstraint,
    });
  };
}
