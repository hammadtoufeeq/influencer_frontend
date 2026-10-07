import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faMagnifyingGlass, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { listAdminUsers, setUserRole, setUserStatus } from '../../api/adminPanel'
import Avatar from '../../components/Avatar'
import AdminPager from '../../components/admin-panel/AdminPager'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import StatusPill from '../../components/admin-panel/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import type { AdminUser } from '../../types/adminPanel'
import type { Role } from '../../types/user'
import { adminErrorMessage, formatDate } from '../../utils/adminFormat'

const ROLES: Role[] = ['talent', 'representative', 'business', 'agency', 'organization', 'admin']
const PAGE_SIZE = 20

type Pending =
  | { kind: 'status'; user: AdminUser; status: AdminUser['status'] }
  | { kind: 'role'; user: AdminUser; role: Role }

function AdminUsersPage() {
  const { t } = useTranslation()
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [pending, setPending] = useState<Pending | null>(null)
  const page = Number(params.get('page')) || 1

  const apiParams = new URLSearchParams(params)
  apiParams.set('limit', String(PAGE_SIZE))

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'users', apiParams.toString()],
    queryFn: () => listAdminUsers(apiParams),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

  const mutation = useMutation({
    mutationFn: (action: Pending) =>
      action.kind === 'status'
        ? setUserStatus(action.user._id, action.status)
        : setUserRole(action.user._id, action.role),
    onSuccess: (_user, action) => {
      toast.success(
        action.kind === 'role'
          ? t('users.roleToast')
          : action.status === 'suspended'
            ? t('users.suspendedToast')
            : t('users.unsuspendedToast'),
      )
      setPending(null)
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (error) => {
      toast.error(adminErrorMessage(error))
      setPending(null)
    },
  })

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== 'page') next.delete('page')
    setParams(next)
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setParam('q', search.trim())
  }

  const select = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm'

  return (
    <>
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')} />

      <div className="mb-4 flex flex-wrap gap-2">
        <form onSubmit={handleSearch} className="flex w-full min-w-0 gap-2 sm:w-auto sm:flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
            aria-label={t('users.searchPlaceholder')}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            aria-label={t('common.search')}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>
        <select
          aria-label={t('users.colRole')}
          value={params.get('role') ?? ''}
          onChange={(e) => setParam('role', e.target.value)}
          className={select}
        >
          <option value="">{t('users.allRoles')}</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('users.colStatus')}
          value={params.get('status') ?? ''}
          onChange={(e) => setParam('status', e.target.value)}
          className={select}
        >
          <option value="">{t('users.allStatuses')}</option>
          <option value="active">{t('users.active')}</option>
          <option value="suspended">{t('users.suspended')}</option>
        </select>
      </div>

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!!data && data.users.length === 0}
        emptyText={t('users.empty')}
        onRetry={() => refetch()}
      >
        {data && (
          <p className="mb-2 text-sm text-gray-500">
            {t('common.total', { count: data.meta.total })}
          </p>
        )}
        <div
          className={`overflow-x-auto rounded-2xl bg-white shadow-sm ${isFetching ? 'opacity-70' : ''}`}
        >
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('users.colUser')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('users.colRole')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('users.colStatus')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('users.colJoined')}</th>
                <th className="px-4 py-3 text-end font-medium">{t('users.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.users.map((user) => {
                const isMe = user._id === me?._id
                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium">
                            {user.name}
                            {isMe && (
                              <span className="ms-2 rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">
                                {t('users.you')}
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={t('users.colRole')}
                        value={user.role}
                        disabled={isMe}
                        title={isMe ? t('users.selfHint') : undefined}
                        onChange={(e) =>
                          setPending({ kind: 'role', user, role: e.target.value as Role })
                        }
                        className={`${select} py-1.5 disabled:bg-gray-50 disabled:text-gray-500`}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {t(`roles.${role}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={user.status} label={t(`users.${user.status}`)} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-end">
                      {isMe ? (
                        <span className="text-xs text-gray-400">{t('users.selfHint')}</span>
                      ) : user.status === 'active' ? (
                        <button
                          onClick={() => setPending({ kind: 'status', user, status: 'suspended' })}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <FontAwesomeIcon icon={faBan} />
                          {t('users.suspend')}
                        </button>
                      ) : (
                        <button
                          onClick={() => setPending({ kind: 'status', user, status: 'active' })}
                          className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                        >
                          <FontAwesomeIcon icon={faRotateLeft} />
                          {t('users.unsuspend')}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {data && (
          <AdminPager
            page={page}
            limit={PAGE_SIZE}
            total={data.meta.total}
            onChange={(p) => setParam('page', String(p))}
          />
        )}
      </DataState>

      <ConfirmDialog
        open={!!pending}
        title={
          pending?.kind === 'role'
            ? t('users.roleTitle', { name: pending.user.name })
            : pending?.status === 'suspended'
              ? t('users.suspendTitle', { name: pending?.user.name })
              : t('users.unsuspendTitle', { name: pending?.user.name })
        }
        tone={pending?.kind === 'status' && pending.status === 'suspended' ? 'danger' : 'default'}
        isBusy={mutation.isPending}
        onConfirm={() => pending && mutation.mutate(pending)}
        onCancel={() => setPending(null)}
      >
        {pending?.kind === 'role'
          ? t('users.roleBody', {
              from: t(`roles.${pending.user.role}`),
              to: t(`roles.${pending.role}`),
            })
          : pending?.status === 'suspended'
            ? t('users.suspendBody')
            : t('users.unsuspendBody')}
      </ConfirmDialog>
    </>
  )
}

export default AdminUsersPage
