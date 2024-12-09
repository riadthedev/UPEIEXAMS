import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    // Add the routes you want to protect            // Protect main page
    '/dashboard/:path*',
    '/profile/:path*',
    // Don't add auth routes here!
    // Don't protect /login, /signup, etc.
  ]
}