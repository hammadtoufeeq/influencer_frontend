import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBan,
  faBell,
  faBuilding,
  faBullhorn,
  faCheckDouble,
  faCircleCheck,
  faCircleQuestion,
  faCircleXmark,
  faFileContract,
  faFileSignature,
  faFlag,
  faStar,
  faTriangleExclamation,
  faTruckFast,
  faRotateLeft,
  faScaleBalanced,
  faHandshake,
  faKey,
  faLock,
  faUserCheck,
  faUserPlus,
  faUserTie,
  faIdCard,
  faInbox,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import {
  NOTIFICATIONS_PAGE_SIZE,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'
import { useAuth } from '../hooks/useAuth'
import {
  CATEGORIES_BY_ROLE,
  NOTIFICATION_CATEGORIES,
  type AppNotification,
  type NotificationCategory,
  type NotificationType,
} from '../types/notification'
import { getApiError } from '../utils/apiError'

// Har type ka icon aur rang
const LOOK: Record<NotificationType, { icon: IconDefinition; tint: string }> = {
  'claim.new': { icon: faUserCheck, tint: 'bg-blue-50 text-blue-700' },
  'claim.new_profile': { icon: faUserPlus, tint: 'bg-violet-50 text-violet-700' },
  'claim.code_verified': { icon: faCircleCheck, tint: 'bg-green-50 text-green-700' },
  'claim.otp_locked': { icon: faLock, tint: 'bg-red-50 text-red-700' },
  'report.new': { icon: faFlag, tint: 'bg-amber-50 text-amber-700' },
  'inquiry.new': { icon: faCircleQuestion, tint: 'bg-sky-50 text-sky-700' },
  'claim.code_sent': { icon: faKey, tint: 'bg-yellow-50 text-yellow-800' },
  'claim.approved': { icon: faIdCard, tint: 'bg-green-50 text-green-700' },
  'claim.rejected': { icon: faCircleXmark, tint: 'bg-gray-100 text-gray-600' },
  'business.new': { icon: faBuilding, tint: 'bg-blue-50 text-blue-700' },
  'business.code_verified': { icon: faCircleCheck, tint: 'bg-green-50 text-green-700' },
  'business.otp_locked': { icon: faLock, tint: 'bg-red-50 text-red-700' },
  'business.code_sent': { icon: faKey, tint: 'bg-yellow-50 text-yellow-800' },
  'business.approved': { icon: faCircleCheck, tint: 'bg-green-50 text-green-700' },
  'business.rejected': { icon: faCircleXmark, tint: 'bg-gray-100 text-gray-600' },
  'hire.new': { icon: faHandshake, tint: 'bg-violet-50 text-violet-700' },
  'hire.accepted': { icon: faHandshake, tint: 'bg-green-50 text-green-700' },
  'hire.declined': { icon: faCircleXmark, tint: 'bg-gray-100 text-gray-600' },
  'hire.cancelled': { icon: faBan, tint: 'bg-gray-100 text-gray-600' },
  'agreement.disputed_admin': { icon: faTriangleExclamation, tint: 'bg-red-50 text-red-700' },
  'agreement.proposed': { icon: faFileContract, tint: 'bg-violet-50 text-violet-700' },
  'agreement.updated': { icon: faFileContract, tint: 'bg-amber-50 text-amber-700' },
  'agreement.signed': { icon: faFileSignature, tint: 'bg-blue-50 text-blue-700' },
  'agreement.active': { icon: faFileSignature, tint: 'bg-green-50 text-green-700' },
  'agreement.cancelled': { icon: faBan, tint: 'bg-gray-100 text-gray-600' },
  'agreement.delivered': { icon: faTruckFast, tint: 'bg-blue-50 text-blue-700' },
  'agreement.approved': { icon: faCircleCheck, tint: 'bg-green-50 text-green-700' },
  'agreement.changes_requested': { icon: faRotateLeft, tint: 'bg-amber-50 text-amber-700' },
  'agreement.completed': { icon: faCircleCheck, tint: 'bg-green-50 text-green-700' },
  'agreement.disputed': { icon: faTriangleExclamation, tint: 'bg-red-50 text-red-700' },
  'agreement.resolved': { icon: faScaleBalanced, tint: 'bg-blue-50 text-blue-700' },
  'agreement.reviewed': { icon: faStar, tint: 'bg-amber-50 text-amber-700' },
  'manager.new': { icon: faUserTie, tint: 'bg-blue-50 text-blue-700' },
  'manager.approved': { icon: faCircleCheck, tint: 'bg-green-50 text-green-700' },
  'manager.rejected': { icon: faCircleXmark, tint: 'bg-gray-100 text-gray-600' },
  'manager.reviewed': { icon: faStar, tint: 'bg-amber-50 text-amber-700' },
  'representation.requested': { icon: faUserTie, tint: 'bg-violet-50 text-violet-700' },
  'representation.invited': { icon: faUserTie, tint: 'bg-violet-50 text-violet-700' },
  'representation.accepted': { icon: faUserTie, tint: 'bg-green-50 text-green-700' },
  'representation.declined': { icon: faCircleXmark, tint: 'bg-gray-100 text-gray-600' },
  'representation.ended': { icon: faBan, tint: 'bg-gray-100 text-gray-600' },
  'hire.new_managed': { icon: faHandshake, tint: 'bg-violet-50 text-violet-700' },
  'hire.answered_by_manager': { icon: faHandshake, tint: 'bg-blue-50 text-blue-700' },
  'campaign.application': { icon: faBullhorn, tint: 'bg-violet-50 text-violet-700' },
  'campaign.accepted': { icon: faBullhorn, tint: 'bg-green-50 text-green-700' },
  'campaign.rejected': { icon: faCircleXmark, tint: 'bg-gray-100 text-gray-600' },
}

// Har tab ka icon
const CATEGORY_ICONS: Record<NotificationCategory, IconDefinition> = {
  hiring: faHandshake,
  campaigns: faBullhorn,
  agreements: faFileContract,
  verification: faCircleCheck,
  manager: faUserTie,
  admin: faShieldHalved,
}

// "5 minutes ago" chuni hui zaban mein
function timeAgo(iso: string, lang: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(0, 'second')
}

// /notifications -> har user ki apni notifications. Click pe parh li + us page pe
function Notifications() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [unreadOnly, setUnreadOnly] = useState(false)
  // Chuna hua tab URL mein (?tab=hiring), taake wapas aane pe wahi khule
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as NotificationCategory | null
  const category = tabParam && NOTIFICATION_CATEGORIES.includes(tabParam) ? tabParam : undefined
  const chooseCategory = (next?: NotificationCategory) =>
    setSearchParams(next ? { tab: next } : {}, { replace: true })

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['notifications', 'list', unreadOnly, category ?? 'all'],
      // Tab badalte waqt purani ginti (badges) dikhti rahe jab tak naya data aaye
      placeholderData: keepPreviousData,
      queryFn: ({ pageParam }) => listNotifications(pageParam, unreadOnly, category),
      initialPageParam: 1,
      getNextPageParam: (last) =>
        last.meta.page * NOTIFICATIONS_PAGE_SIZE < last.meta.total ? last.meta.page + 1 : undefined,
    })

  const items = data?.pages.flatMap((page) => page.notifications) ?? []
  const totalUnread = data?.pages[0]?.unread ?? 0
  const counts = data?.pages[0]?.categories ?? {}
  // Tabs account type ke hisaab se pehle se tay (data ka intezar nahi, click pe ghayab nahi hote)
  const roleTabs = user ? CATEGORIES_BY_ROLE[user.role] : NOTIFICATION_CATEGORIES
  // Kisi aur qism ki notification aayi ho (jaise role badla) to woh tab bhi
  const tabs = NOTIFICATION_CATEGORIES.filter(
    (c) => roleTabs.includes(c) || counts[c] || c === category,
  )
  // Is tab ki unread ginti
  const unread = category ? (counts[category]?.unread ?? 0) : totalUnread

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })

  const open = useMutation({
    mutationFn: async (notification: AppNotification) => {
      if (!notification.readAt) await markNotificationRead(notification._id)
      return notification
    },
    onSuccess: (notification) => {
      refresh()
      navigate(notification.link)
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  const readAll = useMutation({
    mutationFn: () => markAllNotificationsRead(category),
    onSuccess: () => {
      toast.success(t('notifications.allRead'))
      refresh()
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition ${
      active
        ? 'bg-brand text-on-brand shadow-sm'
        : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
    }`
  const badge = (count: number, active: boolean) =>
    count > 0 && (
      <span
        className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] leading-none font-semibold ${
          active ? 'bg-white text-gray-900' : 'bg-red-600 text-white'
        }`}
      >
        {count}
      </span>
    )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t('notifications.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {unread > 0
              ? t('notifications.unreadCount', { count: unread })
              : t('notifications.allCaughtUp')}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => readAll.mutate()}
            disabled={readAll.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* Category tabs: chhoti screen pe side scroll */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="flex gap-2" role="tablist" aria-label={t('notifications.categoriesLabel')}>
          <button
            type="button"
            role="tab"
            aria-selected={!category}
            onClick={() => chooseCategory()}
            className={chip(!category)}
          >
            <FontAwesomeIcon icon={faInbox} className="text-xs" />
            {t('notifications.all')}
            {badge(totalUnread, !category)}
          </button>
          {tabs.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => chooseCategory(c)}
              className={chip(category === c)}
            >
              <FontAwesomeIcon icon={CATEGORY_ICONS[c]} className="text-xs" />
              {t(`notifications.categories.${c}`)}
              {badge(counts[c]?.unread ?? 0, category === c)}
            </button>
          ))}
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-brand"
        />
        {t('notifications.unreadOnly')}
      </label>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200/70" />
          ))}
        </div>
      )}
      {isError && items.length === 0 && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t('common.error')}</p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FontAwesomeIcon icon={faBell} />
          </span>
          <p className="mt-4 font-semibold">
            {unreadOnly
              ? t('notifications.noUnread')
              : category
                ? t('notifications.emptyCategory', {
                    name: t(`notifications.categories.${category}`),
                  })
                : t('notifications.empty')}
          </p>
          <p className="mt-1 text-sm text-gray-500">{t('notifications.emptyHint')}</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70">
          {items.map((notification) => {
            const look = LOOK[notification.type] ?? LOOK['claim.new']
            // Khali data (jaise "verified manager") DB se aata hi nahi: {} maan lo
            const data = notification.data ?? {}
            const isUnread = !notification.readAt
            return (
              <li key={notification._id} className="border-b border-gray-100 last:border-b-0">
                <button
                  type="button"
                  onClick={() => open.mutate(notification)}
                  className={`flex w-full items-start gap-4 px-4 py-4 text-start transition hover:bg-gray-50 sm:px-5 ${
                    isUnread ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${look.tint}`}
                  >
                    <FontAwesomeIcon icon={look.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm leading-relaxed ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                    >
                      {t(`notifications.types.${notification.type.replace('.', '_')}`, {
                        person: data.person ?? t('claims.deletedProfile'),
                        claimant: data.claimant ?? t('claims.deletedUser'),
                        business: data.business ?? '—',
                        title: data.title ?? '',
                        milestone: data.milestone ?? '',
                        rating: data.rating ?? '',
                        campaign: data.campaign ?? '',
                        // Manager / talent ka naam, aur manager ne kya jawab diya
                        name: data.name ?? '',
                        manager: data.manager ?? '',
                        action: data.action ? t(`manager.actionWord.${data.action}`) : '',
                        outcome: data.outcome ? t(`agreements.outcome.${data.outcome}`) : '',
                        reason: data.reason
                          ? t(`reportReason.${data.reason}`, {
                              defaultValue: data.reason,
                            })
                          : '',
                      })}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {timeAgo(notification.createdAt, i18n.language)}
                    </span>
                  </span>
                  {isUnread && (
                    <span
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"
                      aria-label={t('notifications.unread')}
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {hasNextPage && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-60"
          >
            {isFetchingNextPage ? t('common.loading') : t('notifications.loadMore')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Notifications
