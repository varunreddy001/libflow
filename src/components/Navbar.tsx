import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, User, LogOut, LayoutDashboard, ShieldCheck, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function Navbar() {
  const { user, profile, signOut, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-primary-950/80 border-b border-primary-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-accent-500 group-hover:bg-accent-400 transition-colors">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-semibold text-white">LibFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/catalog" className="text-gray-300 hover:text-white transition-colors">
              Browse Books
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 text-accent-400 hover:text-accent-300 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin
                      </Link>
                    )}

                    <div className="flex items-center gap-3 pl-4 border-l border-primary-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="text-sm text-gray-300">{profile?.full_name}</span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-800 transition-colors"
                        title="Sign out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link to="/login" className="btn-ghost text-sm">
                      Sign In
                    </Link>
                    <Link to="/signup" className="btn-primary text-sm">
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-800">
            <div className="flex flex-col gap-2">
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-800 rounded-lg"
              >
                Browse Books
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-800 rounded-lg flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-4 py-2 text-accent-400 hover:text-accent-300 hover:bg-primary-800 rounded-lg flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}

                      <hr className="border-primary-800 my-2" />

                      <div className="px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-300" />
                          </div>
                          <span className="text-sm text-gray-300">{profile?.full_name}</span>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-primary-800"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-primary-800 rounded-lg"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="mx-4 btn-primary text-center"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

