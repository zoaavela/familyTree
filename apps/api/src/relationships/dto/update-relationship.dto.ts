import { IsDateString, IsOptional } from 'class-validator';

export class UpdateRelationshipDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
