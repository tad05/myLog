// import { IsString, IsInt, MinLength, IsUppercase } from 'class-validator';

export class BlogDto {
  //   @IsInt()
  fileId: number;
  title?: string;
  parsedBlocks: any;
  slug?: string;
  searchText?: string;
}
