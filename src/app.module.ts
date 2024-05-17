import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guargs/jwt-auth.guard';
import { PlantTypeModule } from './plant-type/plant-type.module';
import { PlantsModule } from './plants/plants.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    PlantsModule,
    PlantTypeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
