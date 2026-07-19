import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['delivery', 'pickup'] })
  @IsOptional()
  @IsString()
  @IsIn(['delivery', 'pickup'])
  deliveryMethod?: 'delivery' | 'pickup';
}
