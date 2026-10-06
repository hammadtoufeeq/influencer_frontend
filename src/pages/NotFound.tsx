import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="text-center">
      <h1 className="text-3xl font-bold">404 - Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-blue-600 underline">
        Go home
      </Link>
    </section>
  )
}

export default NotFound
