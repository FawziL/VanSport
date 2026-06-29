import {
  Controller, Get, Post, Body, Param, Put, Patch, Delete,
  ParseIntPipe, UseGuards, UseInterceptors, UploadedFiles, Query, Res,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List active products' })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all products (admin, including inactive)' })
  findAllAdmin() {
    return this.productsService.findAllAdmin();
  }

  @Get('export')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Export products to Excel (admin)' })
  async export(@Res() res: Response) {
    const buffer = await this.productsService.exportExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="productos.xlsx"`);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a product (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagen', maxCount: 1 },
      { name: 'imagenes_adicionales', maxCount: 10 },
    ]),
  )
  async create(
    @UploadedFiles() files: { imagen?: Express.Multer.File[]; imagenes_adicionales?: Express.Multer.File[] },
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(dto, files);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagen', maxCount: 1 },
      { name: 'imagenes_adicionales', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { imagen?: Express.Multer.File[]; imagenes_adicionales?: Express.Multer.File[] },
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto, files);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Partially update a product (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagen', maxCount: 1 },
      { name: 'imagenes_adicionales', maxCount: 10 },
    ]),
  )
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { imagen?: Express.Multer.File[]; imagenes_adicionales?: Express.Multer.File[] },
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto, files);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
