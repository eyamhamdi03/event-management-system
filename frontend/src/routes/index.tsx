import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, MapPin, Award, Zap, Shield } from 'lucide-react'
import { NotificationTestPanel } from '@/components/NotificationTestPanel'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Manage Events
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}
                Effortlessly
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create, organize, and manage live events with real-time
              discussions, interactive Q&A sessions, and seamless participant
              engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/auth/signup/page">Get Started</Link>
              </Button>              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3"
              >
                <Link to="/auth/login/page">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Development Test Panel */}
          <div className="max-w-2xl mx-auto mt-12">
            <NotificationTestPanel />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Host Amazing Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From live discussions to real-time notifications, our platform
              provides all the tools you need for successful event management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Event Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create and customize events with detailed information,
                  categories, and participant limits.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Live Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enable real-time chat and Q&A sessions with WebSocket
                  technology for interactive engagement.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Real-time Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stay updated with Server-Sent Events for instant notifications
                  about registrations and event updates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Location Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Set event locations and provide detailed venue information for
                  both online and offline events.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle>Category Filtering</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organize events by categories and enable advanced filtering
                  with GraphQL for optimized queries.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Secure user authentication with JWT tokens and Google OAuth
                  integration for seamless access.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-xl opacity-90">Events Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-xl opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-xl opacity-90">Event Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform leverages cutting-edge technologies to deliver a
              fast, reliable, and scalable event management experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
                NestJS
              </Badge>
              <p className="text-sm text-gray-600">REST API Backend</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
                React
              </Badge>
              <p className="text-sm text-gray-600">Frontend Framework</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
                GraphQL
              </Badge>
              <p className="text-sm text-gray-600">Optimized Queries</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
                WebSockets
              </Badge>
              <p className="text-sm text-gray-600">Real-time Chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Create Your First Event?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of organizers who trust our platform to manage their
            events and engage with their audiences in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link to="/event/add/page">Create Event</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3"
            >
              <Link to="/auth/signup/page">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                Event Management System
              </h3>
              <p className="text-gray-400 max-w-md">
                A comprehensive platform for creating and managing live events
                with real-time interactions and seamless user experience.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/auth/signup/page" className="hover:text-white">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/auth/login/page" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/event/add/page" className="hover:text-white">
                    Create Event
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Live Discussions</li>
                <li>Real-time Notifications</li>
                <li>Event Categories</li>
                <li>User Management</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 Event Management System. Built by INSAT Software
              Engineering Students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
