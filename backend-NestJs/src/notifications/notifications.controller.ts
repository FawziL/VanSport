import { Controller, Get, Post, Body, Param, Put, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all global notifications' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('latest-banner')
  @ApiOperation({ summary: 'Get latest banner notification' })
  latestBanner() {
    return this.notificationsService.findLatestBanner();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a notification' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a notification' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotificationDto) {
    return this.notificationsService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Partially update a notification' })
  partialUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotificationDto) {
    return this.notificationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }

  @Post(':id/mark-read')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: string) {
    return this.notificationsService.markRead(id, userId);
  }
}
