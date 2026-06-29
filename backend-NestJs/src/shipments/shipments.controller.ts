import { Controller, Get, Post, Body, Param, Put, Patch, Delete, ParseIntPipe, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { Response } from 'express';

@ApiTags('Shipments')
@Controller('shipments')
@UseGuards(AuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user shipments' })
  findByUser(@CurrentUser('id') userId: string) {
    return this.shipmentsService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a shipment' })
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(dto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get shipments by order' })
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.shipmentsService.findByOrder(orderId);
  }

  @Get('export')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Export shipments to Excel (admin)' })
  async export(@Res() res: Response) {
    const buffer = await this.shipmentsService.exportExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="envios.xlsx"`);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a shipment' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a shipment' })
  partialUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shipment' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}
