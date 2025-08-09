import { BadRequestException, Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../domain/users.service';
import { ResourceNotFoundException } from 'src/common/custom-exceptions/base-custom-exception';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('err-1')
  testCustomException() {
    throw new ResourceNotFoundException('리소스가 존재하지 않습니다.', '테스트');
  }
  @Get('err-2')
  testHttpException() {
    throw new BadRequestException('Bad Request');
  }
  @Get('err-3')
  testServerException() {
    throw new InternalServerErrorException('Bad Request');
  }
}
