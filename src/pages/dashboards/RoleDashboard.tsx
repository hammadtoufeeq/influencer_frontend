import { Link } from 'react-router-dom'
import DashboardHeader from '../../components/DashboardHeader'
import MyProfileSection from '../../components/MyProfileSection'
import type { SignupRole } from '../../types/user'

interface DashboardCard {
  icon: string
  title: string
  description: string
  // Link ho to button chalega, warna "Coming soon"
  action?: { label: string; to: string }
}

interface RoleConfig {
  title: string
  subtitle: string
  cards: DashboardCard[]
}

const EXPLORE: DashboardCard = {
  icon: '🔍',
  title: 'Discover people',
  description:
    'Search journalists, creators, speakers and experts by profession, industry, topic and location.',
  action: { label: 'Explore people', to: '/search' },
}

// Har account type ka apna dashboard. Features aage ke phases mein judenge
const ROLE_DASHBOARDS: Record<SignupRole, RoleConfig> = {
  talent: {
    title: 'Talent dashboard',
    subtitle: 'Manage your public profile, what you offer and who wants to work with you.',
    cards: [
      {
        icon: '🧾',
        title: 'Services & rates',
        description: 'List what you offer (talks, campaigns, podcasts) and your price range.',
      },
      {
        icon: '📅',
        title: 'Availability',
        description: 'Tell businesses what you are open to right now.',
      },
      {
        icon: '📨',
        title: 'Inquiries',
        description: 'Requests from businesses and organizations. Accept or decline.',
      },
    ],
  },
  representative: {
    title: 'Manager dashboard',
    subtitle: 'Handle profiles and inquiries for the talents you represent.',
    cards: [
      {
        icon: '👥',
        title: 'Your talents',
        description: 'Profiles you manage on behalf of the people you represent.',
      },
      {
        icon: '📨',
        title: 'Inquiries',
        description: 'All requests for your talents in one inbox.',
      },
      EXPLORE,
    ],
  },
  business: {
    title: 'Business dashboard',
    subtitle: 'Find the right people for your brand and track your requests.',
    cards: [
      EXPLORE,
      {
        icon: '⭐',
        title: 'Shortlists',
        description: 'Save people you like into lists and share them with your team.',
      },
      {
        icon: '📨',
        title: 'Sent inquiries',
        description: 'Track the requests you sent and their status.',
      },
    ],
  },
  agency: {
    title: 'Agency dashboard',
    subtitle: 'Plan campaigns and manage requests for your clients.',
    cards: [
      EXPLORE,
      {
        icon: '⭐',
        title: 'Shortlists',
        description: 'Build talent lists for each client or campaign.',
      },
      {
        icon: '📨',
        title: 'Sent inquiries',
        description: 'Track every request you sent on behalf of clients.',
      },
    ],
  },
  organization: {
    title: 'Organization dashboard',
    subtitle: 'Find speakers, experts and guests for your events and programs.',
    cards: [
      EXPLORE,
      {
        icon: '🎤',
        title: 'Event requests',
        description: 'Invite speakers and experts and follow up on replies.',
      },
      { icon: '⭐', title: 'Shortlists', description: 'Keep lists of people for upcoming events.' },
    ],
  },
}

function RoleDashboard({ role }: { role: SignupRole }) {
  const config = ROLE_DASHBOARDS[role]

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {role === 'talent' && <MyProfileSection />}

      <div>
        <h2 className="text-lg font-semibold">{config.title}</h2>
        <p className="text-sm text-gray-500">{config.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {config.cards.map((card) => (
          <article
            key={card.title}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-2xl" aria-hidden="true">
                {card.icon}
              </span>
              {!card.action && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                  Coming soon
                </span>
              )}
            </div>
            <h3 className="mt-3 font-semibold">{card.title}</h3>
            <p className="mt-1 flex-1 text-sm text-gray-600">{card.description}</p>
            {card.action && (
              <Link
                to={card.action.to}
                className="mt-4 self-start rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                {card.action.label} →
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

export default RoleDashboard
