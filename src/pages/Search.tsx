import { useTranslation } from "react-i18next";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CountUp, Photo, Reveal } from "../components/home/HomeSections";
import TalentCard from "../components/search/TalentCard";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faPlus,
  faSliders,
  faTableCellsLarge,
  faUserGroup,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { peopleQuery } from "../api/queries";
import Pagination from "../components/Pagination";
import PersonCard from "../components/PersonCard";
import SearchBar from "../components/SearchBar";
import {
  COUNTRY_OPTIONS,
  FOLLOWER_OPTIONS,
  LANGUAGE_OPTIONS,
  SORT_OPTIONS,
  STATUS_LABELS,
} from "../constants/people";
import { useTaxonomy } from "../hooks/useTaxonomy";
import { countryName, languageName } from "../utils/format";
import { OPEN_TO_OPTIONS } from "../constants/services";

const PAGE_SIZE = 12;
// Concert / crowd-with-lights pictures for the banner (faint, like the home hero).
// If the first one fails to load, the next is tried; change or reorder freely.
const HERO_IMAGES = [
  "photo-1470229722913-7c0e2dbbafd3",
  "photo-1429962714451-bb934ecdc4ec",
  "photo-1492684223066-81342ee5ff30",
].map(
  (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1920&q=75`,
);
const FILTER_KEYS = [
  "profession",
  "industry",
  "topic",
  "country",
  "city",
  "language",
  "minFollowers",
  "status",
  "openTo",
];

interface Option {
  value: string;
  label: string;
}

function FilterSelect({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (name: string, value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-gray-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full truncate rounded-xl border bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-900 ${
          value
            ? "border-gray-900 font-medium"
            : "border-gray-200 hover:border-gray-400"
        }`}
      >
        <option value="">{t("search.any")}</option>
        {/* Browse se kai cheezen chuni hon (a,b): ek option "2 selected" */}
        {value.includes(",") && (
          <option value={value}>
            {t("search.multiSelected", { count: value.split(",").length })}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// City likhte waqt har harf pe search na ho: Enter ya bahar click pe lagao
function CityFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);

  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-gray-500">
        {t("search.city")}
      </span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onChange(draft.trim())}
        onKeyDown={(e) => e.key === "Enter" && onChange(draft.trim())}
        placeholder={t("search.cityPlaceholder")}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-gray-900 ${
          value
            ? "border-gray-900 font-medium"
            : "border-gray-200 hover:border-gray-400"
        }`}
      />
    </label>
  );
}

function Search() {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Saare filters URL mein: /search?q=ai&country=PK&page=2
  // Is se link share ho sakta hai aur back button kaam karta hai
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: professions } = useTaxonomy("professions");
  const { data: industries } = useTaxonomy("industries");
  const { data: topics } = useTaxonomy("topics");

  const page = Number(searchParams.get("page")) || 1;
  const params = new URLSearchParams(searchParams);
  params.set("limit", String(PAGE_SIZE));
  if (!params.get("sort")) params.set("sort", "followers");

  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    ...peopleQuery(params),
    // Naya page load hote waqt purane results dikhate raho (khali screen nahi)
    placeholderData: keepPreviousData,
  });

  // Agla page pehle se cache mein la kar rakho, taake "Next" foran khule
  const paramsKey = params.toString();
  const hasNextPage = data ? page * PAGE_SIZE < data.meta.total : false;
  useEffect(() => {
    if (!hasNextPage) return;
    const nextParams = new URLSearchParams(paramsKey);
    nextParams.set("page", String(page + 1));
    queryClient.prefetchQuery(peopleQuery(nextParams));
  }, [hasNextPage, paramsKey, page, queryClient]);

  // Functional updates: hamesha taaza URL params se shuru karo
  function setFilter(name: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(name, value);
      else next.delete(name);
      next.delete("page"); // filter badla to pehle page pe wapas
      return next;
    });
  }

  // "industry=a,b" mein se sirf "a" hatao
  function removeValue(name: string, value: string) {
    const rest = (searchParams.get(name) ?? "")
      .split(",")
      .filter((v) => v && v !== value);
    setFilter(name, rest.join(","));
  }

  function setPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const q = prev.get("q");
      if (q) next.set("q", q);
      return next;
    });
  }

  const get = (name: string) => searchParams.get(name) ?? "";
  const toOptions = (items?: { slug: string; name: string }[]): Option[] =>
    items?.map((item) => ({ value: item.slug, label: item.name })) ?? [];
  const activeFilters = FILTER_KEYS.filter((key) =>
    searchParams.get(key),
  ).length;
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Lagaye gaye filters ke chips: "Industry: Technology ×"
  const optionLabel = (options: Option[], value: string) =>
    options.find((o) => o.value === value)?.label ?? value;
  const countryOptions = COUNTRY_OPTIONS.map((code) => ({
    value: code,
    label: countryName(code),
  }));
  const languageOptions = LANGUAGE_OPTIONS.map((code) => ({
    value: code,
    label: languageName(code),
  }));
  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  // Jo log abhi is kaam ke liye khule hain
  const openToOptions = OPEN_TO_OPTIONS.map((o) => ({
    value: o.value,
    label: t(`services.openToOption.${o.value}`),
  }));
  const filterDefs: { key: string; label: string; options?: Option[] }[] = [
    {
      key: "profession",
      label: t("search.profession"),
      options: toOptions(professions),
    },
    {
      key: "industry",
      label: t("search.industry"),
      options: toOptions(industries),
    },
    { key: "topic", label: t("search.topic"), options: toOptions(topics) },
    { key: "country", label: t("search.country"), options: countryOptions },
    { key: "city", label: t("search.city") },
    { key: "language", label: t("search.language"), options: languageOptions },
    {
      key: "minFollowers",
      label: t("search.followers"),
      options: FOLLOWER_OPTIONS,
    },
    { key: "status", label: t("search.availability"), options: statusOptions },
    { key: "openTo", label: t("search.openTo"), options: openToOptions },
  ];
  // Har chuni value ka alag chip (Browse se kai aa sakti hain), alag se hatane ke liye
  const chips = filterDefs
    .filter((f) => get(f.key))
    .flatMap((f) =>
      get(f.key)
        .split(",")
        .filter(Boolean)
        .map((value) => ({
          key: `${f.key}:${value}`,
          text: `${f.label}: ${f.options ? optionLabel(f.options, value) : value}`,
          remove: () => removeValue(f.key, value),
        })),
    );
  const match = get("match");
  if ((match === "all" || match === "any") && chips.length > 1) {
    chips.push({
      key: "match",
      text: t(`search.matchChip.${match}`),
      remove: () => setFilter("match", ""),
    });
  }

  // Sirf guest (login ke baad) aur talent khud profile bhej sakte hain
  const canCreateProfile = !user || user.role === "talent";

  let results: ReactNode;
  if (isLoading) {
    results = (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-3xl bg-gray-200/70"
          />
        ))}
      </div>
    );
  } else if (isError && !data) {
    results = (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {t("search.loadError")}
      </p>
    );
  } else if (data && data.people.length === 0) {
    results = (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <FontAwesomeIcon icon={faUserGroup} />
        </span>
        <p className="mt-4 font-semibold">{t("search.noResults")}</p>
        <p className="mt-1 text-sm text-gray-500">
          {t("search.noResultsHint")}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              {t("search.clearFilters")}
            </button>
          )}
          {canCreateProfile && (
            <Link
              to="/my-profile/new"
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              {t("newProfile.ctaLong")}
            </Link>
          )}
        </div>
      </div>
    );
  } else {
    results = (
      <>
        {view === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.people.map((person, i) => (
              <Reveal key={person._id} delay={(i % 4) * 90}>
                <TalentCard person={person} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {data?.people.map((person) => (
              <PersonCard key={person._id} person={person} />
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        {/* Talent ko apni profile na mile to khud bheje */}
        {canCreateProfile && (
          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold">{t("newProfile.bannerTitle")}</p>
              <p className="mt-0.5 text-sm text-gray-500">
                {t("newProfile.bannerBody")}
              </p>
            </div>
            <Link
              to="/my-profile/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              {t("newProfile.cta")}
            </Link>
          </div>
        )}
      </>
    );
  }

  // The hero is fixed: it always shows the same top profiles and the full count,
  // whatever is typed or filtered below
  const { data: heroData } = useQuery({
    ...peopleQuery(new URLSearchParams({ limit: "5", sort: "followers" })),
    staleTime: 5 * 60 * 1000,
  });
  const faces = heroData?.people ?? [];
  const heroTotal = heroData?.meta.total ?? 0;
  const filterFields = (
    <div className="space-y-4">
      {filterDefs.map((f) =>
        f.key === "city" ? (
          <CityFilter
            key={`city-${get("city")}`}
            value={get("city")}
            onChange={(value) => setFilter("city", value)}
          />
        ) : (
          <FilterSelect
            key={f.key}
            label={f.label}
            name={f.key}
            value={get(f.key)}
            options={f.options ?? []}
            onChange={setFilter}
          />
        ),
      )}
    </div>
  );
  const filtersHeader = (
    <div className="flex items-center justify-between gap-3">
      <p className="inline-flex items-center gap-2 font-semibold">
        <FontAwesomeIcon icon={faSliders} className="text-gray-500" />
        {t("search.filters")}
        {activeFilters > 0 && (
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white">
            {activeFilters}
          </span>
        )}
      </p>
      {activeFilters > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
        >
          {t("search.clearAllFilters")}
        </button>
      )}
    </div>
  );
  const viewButton = (mode: "grid" | "list", icon: typeof faList) => (
    <button
      type="button"
      onClick={() => setView(mode)}
      aria-pressed={view === mode}
      aria-label={mode}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition ${
        view === mode
          ? "bg-gray-900 text-white"
          : "text-gray-500 hover:text-gray-900"
      }`}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="keep-dark relative isolate overflow-hidden rounded-3xl bg-brand-plum px-5 py-10 text-white sm:px-8 md:py-14">
        {/* Background picture, same low opacity as the home hero */}
        {heroIndex < HERO_IMAGES.length && (
          <img
            key={heroIndex}
            src={HERO_IMAGES[heroIndex]}
            alt=""
            decoding="async"
            onError={() => setHeroIndex((i) => i + 1)}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-plum/80 via-brand-plum/30 to-transparent rtl:bg-gradient-to-l" />
        <div className="absolute -start-20 -top-24 -z-10 h-80 w-80 animate-drift rounded-full bg-white/10 blur-3xl" />
        <div
          className="absolute -bottom-24 end-10 -z-10 h-72 w-72 animate-drift rounded-full bg-gray-400/20 blur-3xl"
          style={{ animationDelay: "-7s" }}
        />
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">
              {t("search.title")}
            </h1>
            <p className="mt-3 max-w-xl text-white/75">
              {t("search.subtitle")}
            </p>
            <div className="mt-6 max-w-xl">
              <SearchBar
                initialValue={get("q")}
                tone="onDark"
                onQueryChange={(value) => setFilter("q", value)}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {professions?.slice(0, 6).map((p) => {
                const on = get("profession") === p.slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setFilter("profession", on ? "" : p.slug)}
                    className={`rounded-full border px-3 py-1.5 transition ${
                      on
                        ? "border-white bg-white text-gray-900"
                        : "border-white/25 bg-white/10 text-white/90 hover:bg-white/20"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
          {faces.length > 0 && (
            <div className="hidden flex-col items-center gap-4 lg:flex">
              <div className="flex -space-x-4 rtl:space-x-reverse">
                {faces.map((p, i) => (
                  <Link
                    key={p._id}
                    to={`/people/${p.slug}`}
                    style={{ animationDelay: `${i * -1.4}s` }}
                    className="animate-float"
                  >
                    <Photo
                      person={p}
                      className="h-20 w-20 rounded-full ring-4 ring-brand-plum"
                    />
                  </Link>
                ))}
              </div>
              <p className="font-display text-5xl font-extrabold">
                <CountUp value={heroTotal} />
              </p>
              <p className="text-sm text-white/70">{t("home.statProfiles")}</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        {/* Filters: sticky side panel on desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            {filtersHeader}
            {filterFields}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {/* Toolbar: count, view toggle, sort, mobile filters button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              {data ? (
                <>
                  <span className="font-semibold text-gray-900">{total}</span>{" "}
                  {t("search.peopleFound", { count: total })}
                </>
              ) : (
                " "
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium lg:hidden"
              >
                <FontAwesomeIcon icon={faSliders} />
                {t("search.filters")}
                {activeFilters > 0 && (
                  <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] text-white">
                    {activeFilters}
                  </span>
                )}
              </button>
              <div className="flex rounded-xl border border-gray-200 bg-white p-0.5">
                {viewButton("grid", faTableCellsLarge)}
                {viewButton("list", faList)}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-500">
                <span className="hidden sm:inline">{t("search.sortBy")}</span>
                <select
                  value={get("sort") || "followers"}
                  onChange={(e) => setFilter("sort", e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 hover:border-gray-400"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.key} className="animate-fade">
                  <button
                    type="button"
                    onClick={chip.remove}
                    aria-label={t("search.removeFilter", { name: chip.text })}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-900 hover:text-white"
                  >
                    {chip.text}
                    <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <section>{results}</section>
        </div>
      </div>

      {/* Mobile filters: bottom sheet */}
      {showFilters &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 animate-fade bg-black/60"
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] animate-word overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex-1">{filtersHeader}</div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              {filterFields}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="mt-5 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
              >
                {total} {t("search.peopleFound", { count: total })}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Search;