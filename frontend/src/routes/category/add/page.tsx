import { CreateCategoryForm } from '@/components/forms/add-category'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/category/add/page')({
  component: AddCategoryPage,
})

export default function AddCategoryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">
        <CreateCategoryForm />
      </div>
    </div>
  )
}
