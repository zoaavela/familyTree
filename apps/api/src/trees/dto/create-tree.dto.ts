import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum TreeTypeDto {
    PERSONAL = 'PERSONAL',
    REFERENCE = 'REFERENCE',
}

export enum VisibilityDto {
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
    UNLISTED = 'UNLISTED',
}

export class CreateTreeDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(TreeTypeDto)
    type: TreeTypeDto;

    @IsOptional()
    @IsEnum(VisibilityDto)
    visibility?: VisibilityDto;
}