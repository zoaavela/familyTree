import { IsDateString, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export enum GenderDto {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
    UNKNOWN = 'UNKNOWN',
}

export class CreatePersonDto {
    @IsString()
    @MinLength(1)
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEnum(GenderDto)
    gender?: GenderDto;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsDateString()
    deathDate?: string;

    @IsOptional()
    @IsString()
    birthPlace?: string;

    @IsOptional()
    @IsString()
    deathPlace?: string;

    @IsOptional()
    @IsString()
    biography?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}