import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { NotificationsService } from './notifications.service';
import {
  NotificationsServiceController,
  NotificationsServiceControllerMethods,
} from '@app/common';

@Controller()
@NotificationsServiceControllerMethods()
export class NotificationsController implements NotificationsServiceController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UsePipes(new ValidationPipe())
  async notifyEmail(data: NotifyEmailDto) {
    this.notificationsService.notifyEmail(data);
  }
}
