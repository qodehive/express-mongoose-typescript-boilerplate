import { IsInt, Max, Min, ValidateIf, ValidationOptions } from "class-validator";

export class PaginationDto {
  @IsInt()
  @Min(1)
  pageNumber!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  pageSize!: number;
}

export function IsOptional2(validationOptions?: ValidationOptions) {
  return ValidateIf((obj, value) => {
    return value !== null && value !== undefined && value !== "";
  }, validationOptions);
}
