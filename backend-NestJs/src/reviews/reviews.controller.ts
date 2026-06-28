import { Controller, Get, Post, Body, Param, Put, Patch, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard, RolesGuard } from '../common/guards';
import { CurrentUser, Roles } from '../common/decorators';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List all reviews' })
  @ApiQuery({ name: 'productId', required: false })
  async findAll(@Query('productId') productId?: string) {
    if (productId) {
      return this.reviewsService.findByProduct(parseInt(productId));
    }
    return this.reviewsService.findAll();
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all reviews (admin, with product/user info)' })
  findAllAdmin() {
    return this.reviewsService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a review' })
  create(@Body() dto: CreateReviewDto, @CurrentUser('id') userId: string) {
    return this.reviewsService.create(dto, userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a review' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto, @CurrentUser('id') userId: string) {
    return this.reviewsService.update(id, dto, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Partially update a review' })
  partialUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto, @CurrentUser('id') userId: string) {
    return this.reviewsService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a review' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: string) {
    return this.reviewsService.remove(id, userId);
  }

  @Put('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update any review (admin)' })
  updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateAdmin(id, dto);
  }

  @Patch('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Partially update any review (admin)' })
  partialUpdateAdmin(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateAdmin(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete any review (admin)' })
  removeAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.removeAdmin(id);
  }
}
