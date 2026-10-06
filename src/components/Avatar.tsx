import { initials } from '../utils/format'

interface AvatarProps {
  name: string
  photoUrl?: string
  size?: 'md' | 'lg'
}

function Avatar({ name, photoUrl, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'lg' ? 'h-24 w-24 text-3xl' : 'h-14 w-14 text-lg'

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    )
  }

  // Photo nahi to naam ke pehle huroof
  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gray-900 font-semibold text-white`}
    >
      {initials(name)}
    </div>
  )
}

export default Avatar
