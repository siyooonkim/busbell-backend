import {
  Controller,
  Get,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserProfileDto } from './dtos/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getProfile(@CurrentUser() user: User): Promise<UserProfileDto> {
    return this.usersService.getProfile(user.id);
  }

  // ✅ 회원 탈퇴
  @Delete()
  @ApiOperation({ summary: '회원 탈퇴 (Soft Delete)' })
  @ApiResponse({ status: 200, description: '탈퇴 완료' })
  async deleteUser(@CurrentUser() user: User) {
    return this.usersService.softDelete(user.id);
  }
}
