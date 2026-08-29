import { getAvatarColor, getInitials } from '../utils/dataManager.js'

export default function Avatar({ user, size = 36 }) {
  if (!user) return null
  const color = getAvatarColor(user.id)
  const initials = getInitials(user.firstName, user.lastName)
  const fontSize = Math.max(10, Math.floor(size * 0.38))

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize,
        flexShrink: 0,
      }}
      title={`${user.firstName} ${user.lastName}`}
    >
      {initials}
    </div>
  )
}
