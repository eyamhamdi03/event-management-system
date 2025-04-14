import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories(): Promise<Category[]> {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string): Promise<Category> {
    return await this.categoryService.findOne(id);
  }

  @Post()
  async createCategory(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.create(dto);
  }

  @Put(':id')
  async replaceCategory(
    @Param('id') id: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return await this.categoryService.remove(id);
  }
}
