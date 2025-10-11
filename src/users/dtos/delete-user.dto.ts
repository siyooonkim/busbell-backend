import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiProperty({
    example: 'password123!',
    description: '비밀번호 확인',
  })
  @IsString()
  password: string;
}

export class DeleteUserResponseDto {
  @ApiProperty({ example: '회원 탈퇴가 완료되었습니다' })
  message: string;
}
