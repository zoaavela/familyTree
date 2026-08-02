import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum RelationshipTypeDto {
    PARENT_OF = 'PARENT_OF',
    SPOUSE_OF = 'SPOUSE_OF',
}

export class CreateRelationshipDto {
    @IsString()
    personAId: string;

    @IsString()
    personBId: string;

    @IsEnum(RelationshipTypeDto)
    type: RelationshipTypeDto;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}