import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Calendar, User, PlusCircle } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <nav className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EventHub</span>
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/event/details/page"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Browse Events
              </Link>
            </div>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/event/add/page" className="flex items-center space-x-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create Event</span>
              </Link>
            </Button>

            <Button asChild variant="ghost" size="sm">
              <Link to="/auth/login/page" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </Button>

            <Button asChild size="sm">
              <Link to="/auth/signup/page">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
