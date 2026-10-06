import { PLATFORM_NAME } from '../constants/config'

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="border-t bg-white">
      <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-gray-500">
        © {currentYear} {PLATFORM_NAME}
      </p>
    </footer>
  )
}

export default Footer
