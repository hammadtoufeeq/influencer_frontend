import { useState } from 'react'
import { initials } from '../utils/format'

interface AvatarProps {
  name: string
  photoUrl?: string
  size?: 'sm' | 'md' | 'lg'
}

function Avatar({ name, photoUrl, size = 'md' }: AvatarProps) {
  // Photo load na ho (link toot gaya) to bhi initials dikhao
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const sizeClass =
    size === 'lg' ? 'h-24 w-24 text-3xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-14 w-14 text-lg'

  if (photoUrl && failedUrl !== photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(photoUrl)}
        // Chehra aksar tasveer ke upar wale hisse mein hota hai
        className={`${sizeClass} shrink-0 rounded-full bg-gray-100 object-cover object-[center_20%] ring-1 ring-gray-200`}
      />
    )
  }

  // Photo nahi to naam ke pehle huroof
  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-on-brand`}
    >
      {initials(name)}
    </div>
  )
}

export default Avatar
