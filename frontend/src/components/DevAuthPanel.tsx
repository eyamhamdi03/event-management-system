import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function DevAuthPanel() {
    if (import.meta.env.PROD) {
        return null
    }

    const createTestUser = async (role: 'admin' | 'organizer' | 'user') => {
        try {
            const testUser = {
                email: `test-${role}@gmail.com`,
                password: '21055271aa',
                fullName: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                role: role.toUpperCase()
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testUser),
            })

            if (response.ok) {
                console.log(`Test ${role} created successfully:`, testUser.email)
                alert(`Test ${role} created! Email: ${testUser.email}, Password: ${testUser.password}`)
            } else {
                const error = await response.text()
                console.error('Failed to create test user:', error)
                alert('Failed to create test user. User might already exist.')
            }
        } catch (error) {
            console.error('Error creating test user:', error)
            alert('Error creating test user')
        }
    }

    return (
        <Card className="mt-4 border-orange-200 bg-orange-50">
            <CardHeader>
                <CardTitle className="text-sm text-orange-800">
                    Development Auth Panel
                    <Badge variant="outline" className="ml-2 text-xs">DEV ONLY</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-xs text-orange-600 mb-3">
                    Create test accounts for testing authentication flows:
                </p>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => createTestUser('admin')}
                        className="text-xs"
                    >
                        Create Test Admin
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => createTestUser('organizer')}
                        className="text-xs"
                    >
                        Create Test Organizer
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => createTestUser('user')}
                        className="text-xs"
                    >
                        Create Test User
                    </Button>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                    <p><strong>All test accounts use password:</strong> password123</p>
                </div>
            </CardContent>
        </Card>
    )
}
