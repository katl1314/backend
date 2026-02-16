import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModel } from './entity/tag.entity';
import { TagService } from './tag.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([TagModel])],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
