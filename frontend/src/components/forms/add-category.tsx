import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateCategory } from '@/hooks/useCreateCategory'

export function CreateCategoryForm() {
  const [name, setName] = useState('')
  const {
    mutate: createCategory,
    isPending: isLoading,
    isSuccess,
  } = useCreateCategory()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    createCategory({ name })
  }

  if (isSuccess) {
    return (
      <div className="text-center pt-12">
        <h2 className="text-2xl font-semibold">Category created!</h2>
        <p className="mt-2 text-muted-foreground">
          It can now be used in events.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center px-4 pt-8">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="mb-[8px] block">
                    Category Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Adding category…' : 'Add Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
