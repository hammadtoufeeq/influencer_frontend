import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faBriefcase,
  faCircle,
  faIdCard,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import {
  MY_SERVICES_KEY,
  createService,
  deleteService,
  getMyServices,
  saveAvailability,
  updateService,
} from '../../api/services'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import AvailabilityPanel from '../../components/services/AvailabilityPanel'
import ServiceCard from '../../components/services/ServiceCard'
import ServiceDialog from '../../components/services/ServiceDialog'
import { MAX_SERVICES, categoryIcon } from '../../constants/services'
import { STATUS_LABELS } from '../../constants/people'
import type { MyServices, Service, ServiceInput } from '../../types/services'
import type { ProfileStatus } from '../../types/person'
import { getApiError } from '../../utils/apiError'

// Khali list pe ek click se shuru karne ke liye
const TEMPLATES: Partial<ServiceInput>[] = [
  { category: 'keynote', pricing: { type: 'fixed', currency: 'PKR', unit: 'event' } },
  { category: 'brand_campaign', pricing: { type: 'range', currency: 'PKR', unit: 'project' } },
  { category: 'podcast_guest', pricing: { type: 'quote', currency: 'PKR', unit: 'event' } },
]

type DialogState =
  | { mode: 'new'; initial?: Partial<ServiceInput> }
  | { mode: 'edit'; service: Service }

// /dashboard/services -> talent apni services aur availability sambhalta hai.
// personId: manager apne talent ki taraf se (talent workspace ke andar, apna heading nahi)
function ServicesPage({ personId }: { personId?: string } = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const servicesKey = personId ? [...MY_SERVICES_KEY, personId] : MY_SERVICES_KEY
  const { data, isLoading, error } = useQuery({
    queryKey: servicesKey,
    queryFn: () => getMyServices(personId),
    retry: false,
  })
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [dialogErrors, setDialogErrors] = useState<Record<string, string>>({})
  const [toDelete, setToDelete] = useState<Service | null>(null)

  // Server ka jawab hi naya sach: cache foran update
  const apply = (next: MyServices) => queryClient.setQueryData(servicesKey, next)
  const fail = (err: unknown) => toast.error(getApiError(err).message)

  const save = useMutation({
    mutationFn: (input: ServiceInput) =>
      dialog?.mode === 'edit'
        ? updateService(dialog.service._id, input, personId)
        : createService(input, personId),
    onMutate: () => setDialogErrors({}),
    onSuccess: (next) => {
      apply(next)
      toast.success(dialog?.mode === 'edit' ? t('services.updated') : t('services.added'))
      setDialog(null)
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setDialogErrors(fields)
      toast.error(message)
    },
  })

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateService(id, { isActive }, personId),
    onSuccess: (next, { isActive }) => {
      apply(next)
      toast.success(isActive ? t('services.shown') : t('services.hiddenToast'))
    },
    onError: fail,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteService(id, personId),
    onSuccess: (next) => {
      apply(next)
      toast.success(t('services.deleted'))
      setToDelete(null)
    },
    onError: fail,
  })

  const availability = useMutation({
    mutationFn: (input: Parameters<typeof saveAvailability>[0]) => saveAvailability(input, personId),
    onSuccess: (next) => {
      apply(next)
      toast.success(t('services.availabilitySaved'))
    },
    onError: fail,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl space-y-4" aria-busy="true">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-gray-200/70" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="h-80 flex-1 animate-pulse rounded-2xl bg-gray-200/70" />
          <div className="h-80 w-full animate-pulse rounded-2xl bg-gray-200/70 lg:w-[400px] lg:shrink-0" />
        </div>
      </div>
    )
  }

  // Abhi koi profile claim nahi: pehle profile chahiye
  const noProfile = axios.isAxiosError(error) && error.response?.status === 404
  if (noProfile || !data) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200/70">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <FontAwesomeIcon icon={faBriefcase} />
        </span>
        <h1 className="mt-4 text-xl font-bold">
          {noProfile ? t('services.noProfileTitle') : t('common.error')}
        </h1>
        {noProfile && (
          <>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {t('services.noProfileText')}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-hover"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                {t('services.findProfile')}
              </Link>
              <Link
                to="/my-profile/new"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faIdCard} />
                {t('services.createProfile')}
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  const { person, services } = data
  const activeCount = services.filter((s) => s.isActive).length
  const isOpen = Boolean(data.availability?.isOpen)
  const atLimit = services.length >= MAX_SERVICES
  const busyId = toggle.isPending ? toggle.variables?.id : undefined

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {personId ? (
          <span />
        ) : (
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('services.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('services.subtitle')}</p>
          </div>
        )}
        <Link
          to={`/people/${person.slug}`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          {t('services.viewPublic')}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
        </Link>
      </div>

      {/* Ek nazar mein: kaam le raha hoon? kitni services? profile ki haalat */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/70">
          <p className="text-xs text-gray-500">{t('services.statWork')}</p>
          <p
            className={`mt-1 flex items-center gap-2 font-semibold ${isOpen ? 'text-green-700' : 'text-gray-700'}`}
          >
            <FontAwesomeIcon
              icon={faCircle}
              className={`text-[8px] ${isOpen ? 'text-green-500' : 'text-gray-400'}`}
            />
            {isOpen ? t('services.openForWork') : t('services.notTakingWork')}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/70">
          <p className="text-xs text-gray-500">{t('services.statServices')}</p>
          <p className="mt-1 font-semibold text-gray-900">
            {t('services.activeOf', { active: activeCount, total: services.length })}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/70">
          <p className="text-xs text-gray-500">{t('services.statProfile')}</p>
          <p className="mt-1 font-semibold text-gray-900">
            {STATUS_LABELS[person.status as ProfileStatus] ?? person.status}
          </p>
        </div>
      </div>
      {!isOpen || activeCount === 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('services.hireableHint')}
        </p>
      ) : null}

      {/* ✅ GRID KHATAM — flex layout. Desktop pe services left (flex-1), sidebar right (fixed) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Services list — left side, full width */}
        <section className="w-full space-y-4 lg:flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{t('services.yourServices')}</h2>
              <p className="text-xs text-gray-500">
                {t('services.limit', { count: services.length, max: MAX_SERVICES })}
              </p>
            </div>
            <button
              type="button"
              disabled={atLimit}
              title={atLimit ? t('services.limitReached') : undefined}
              onClick={() => setDialog({ mode: 'new' })}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('services.addService')}
            </button>
          </div>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <FontAwesomeIcon icon={faBriefcase} />
              </span>
              <p className="mt-4 font-semibold">{t('services.emptyTitle')}</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                {t('services.emptyText')}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.category}
                    type="button"
                    onClick={() =>
                      setDialog({
                        mode: 'new',
                        initial: {
                          ...template,
                          title: t(`services.template.${template.category}`),
                        },
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:border-gray-900"
                  >
                    <FontAwesomeIcon
                      icon={categoryIcon(template.category!)}
                      className="text-gray-500"
                    />
                    {t(`services.template.${template.category}`)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ✅ SIMPLE STACKED LIST — koi grid nahi */
            <div className="space-y-4">
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  isBusy={busyId === service._id}
                  onToggle={(isActive) => toggle.mutate({ id: service._id, isActive })}
                  onEdit={() => setDialog({ mode: 'edit', service })}
                  onDelete={() => setToDelete(service)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar — mobile pe neeche, desktop pe right side fixed width */}
        <div className="w-full lg:sticky lg:top-24 lg:w-[400px] lg:shrink-0 xl:w-[440px]">
          <AvailabilityPanel
            // Server se naya data aaye to form usi se dobara shuru
            key={data.availability?.updatedAt ?? 'none'}
            availability={data.availability}
            isSaving={availability.isPending}
            onSave={(input) => availability.mutate(input)}
          />
        </div>
      </div>

      {dialog && (
        <ServiceDialog
          service={dialog.mode === 'edit' ? dialog.service : undefined}
          initial={dialog.mode === 'new' ? dialog.initial : undefined}
          isSaving={save.isPending}
          errors={dialogErrors}
          onSave={(input) => save.mutate(input)}
          onClose={() => {
            setDialog(null)
            setDialogErrors({})
          }}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={t('services.deleteTitle')}
        tone="danger"
        confirmLabel={t('services.delete')}
        isBusy={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      >
        {t('services.deleteBody', { title: toDelete?.title ?? '' })}
      </ConfirmDialog>
    </div>
  )
}

export default ServicesPage