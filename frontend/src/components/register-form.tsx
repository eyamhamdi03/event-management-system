import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SignupPayload {
  fullName: string
  email: string
  phone: string
  password: string
  birthDate: string
  role: 'organizer' | 'participant'
}

interface SignupFormProps {
  onSubmit: (payload: SignupPayload) => void
  isLoading?: boolean
  className?: string
}

export function SignupForm({ onSubmit, isLoading = false }: SignupFormProps) {
  const [birthDate, setBirthDate] = useState<Date>()
  const [role, setRole] = useState<'organizer' | 'participant'>('participant')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const password = form.get('password') as string

    setPasswordError(null)

    onSubmit({
      fullName: form.get('fullName') as string,
      email: form.get('email') as string,
      phone: form.get('phone') as string,
      password,
      birthDate: birthDate ? birthDate.toISOString().split('T')[0] : '',
      role,
    })
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create an account and join our events now !</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Signup with Google
                  </Button>
                </div>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or create account with email
                  </span>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      name="phone"
                      type="tel"
                      placeholder="+216 99999999"
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="date-of-birth">Date of Birth</Label>
                    <DatePicker date={birthDate} setDate={setBirthDate} />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="role">
                      Are you an event organizer or a participant ?
                    </Label>
                    <Select
                      value={role}
                      onValueChange={(value) =>
                        setRole(value as 'organizer' | 'participant')
                      }
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organizer">Organizer</SelectItem>
                        <SelectItem value="participant">Participant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="*******"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                    </div>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="*******"
                      required
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account…' : 'Sign Up'}
                  </Button>
                </div>
              </div>
            </form>
            <p className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link
                to="/auth/login/page"
                className="underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our{' '}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}
