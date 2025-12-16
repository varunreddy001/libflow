export { authService } from './auth'
export { authorService, categoryService, bookService } from './inventory'
export { loansService } from './loans'
export type { CreateAuthorData, UpdateAuthorData, CreateCategoryData, CreateBookData, UpdateBookData } from './inventory'
export type { BorrowResult, ReturnResult } from './loans'

