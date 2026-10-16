import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faHandshake,
  faMagnifyingGlass,
  faPaperPlane,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "../../components/Pagination";
import { CampaignTile } from "./CampaignTile";
import { CountUp, Reveal } from "../../components/home/HomeSections";
import { campaignsQuery } from "../../api/queries";
import { COUNTRY_OPTIONS } from "../../constants/people";
import { SERVICE_CATEGORIES } from "../../constants/services";
import { useAuth } from "../../hooks/useAuth";
import { countryName } from "../../utils/format";

const PAGE_SIZE = 12;
// Upar wale card ki tasveer (Unsplash): camera ke saath content shoot
const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80";

const selectClass =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900";

// /campaigns: businesses ki khuli campaigns, jin pe talent khud apply karte hain
function CampaignsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const country = searchParams.get("country") ?? "";
  const page = Number(searchParams.get("page")) || 1;
  const [draft, setDraft] = useState(q);

  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (country) params.set("country", country);
  const { data, isLoading, isError, refetch } = useQuery({
    ...campaignsQuery(params),
    placeholderData: keepPreviousData,
  });
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(q || category || country);

  // Filter badle to pehla safha
  function setFilter(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      return next;
    });
  }
  function search(e: FormEvent) {
    e.preventDefault();
    setFilter("q", draft.trim());
  }
  function setPage(next: number) {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set("page", String(next));
      return nextParams;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const postButton =
    user?.role === "business" ? (
      <Link
        to="/dashboard/campaigns/new"
        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xs" />
        {t("campaigns.new")}
      </Link>
    ) : !user ? (
      <Link
        to="/register?type=business"
        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        <FontAwesomeIcon icon={faBullhorn} className="text-xs" />
        {t("campaigns.postOne")}
      </Link>
    ) : null;

  // ✅ Spotlight logic removed — saari campaigns grid mein
  const gridItems = data?.items ?? [];

  let results: ReactNode;
  if (isLoading) {
    results = (
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl bg-gray-200/70 sm:h-80 sm:rounded-3xl"
          />
        ))}
      </div>
    );
  } else if (isError) {
    results = (
      <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-sm ring-1 ring-gray-200/70 sm:px-6 sm:py-12">
        <p className="text-sm font-semibold sm:text-base">{t("common.error")}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  } else if (!data || data.items.length === 0) {
    results = (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center sm:rounded-3xl sm:px-6 sm:py-14">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <FontAwesomeIcon icon={filtered ? faMagnifyingGlass : faBullhorn} />
        </span>
        <p className="mt-4 text-sm font-semibold sm:text-base">
          {filtered ? t("campaigns.noMatch") : t("campaigns.emptyTitle")}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs text-gray-500 sm:text-sm">
          {filtered ? t("directory.noMatchHint") : t("campaigns.emptyText")}
        </p>
        {!filtered && postButton && <div className="mt-5">{postButton}</div>}
      </div>
    );
  } else {
    results = (
      <>
        {/* ✅ Sirf grid — koi spotlight nahi */}
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {gridItems.map((campaign, i) => (
            <Reveal key={campaign._id} delay={(i % 4) * 90} className="h-full">
              <CampaignTile campaign={campaign} />
            </Reveal>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-4 sm:space-y-6 sm:px-6 2xl:max-w-screen-2xl 2xl:px-8">
      {/* Header */}
      <section className="keep-dark relative isolate overflow-hidden rounded-2xl bg-gray-900 px-4 py-8 text-white sm:rounded-3xl sm:px-8 sm:py-10 md:py-14 2xl:px-12 2xl:py-20">
        <img
          src={HEADER_IMAGE}
          alt=""
          decoding="async"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-950/95 via-gray-950/75 to-gray-950/25 rtl:bg-gradient-to-l" />
        <div className="max-w-2xl 2xl:max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-medium tracking-wider text-white/60 uppercase sm:text-xs">
            <FontAwesomeIcon icon={faBullhorn} />
            {t("campaigns.eyebrow")}
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl 2xl:text-4xl">
            {t("campaigns.title")}
          </h1>
          <p className="mt-1 text-xs text-white/70 sm:text-sm 2xl:text-base">
            {t("campaigns.subtitle")}
          </p>

          <form
            onSubmit={search}
            className="mt-5 flex max-w-lg flex-col gap-2 sm:flex-row 2xl:max-w-xl"
            role="search"
          >
            <label className="relative flex-1">
              <span className="sr-only">{t("campaigns.searchLabel")}</span>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("campaigns.searchPlaceholder")}
                className="w-full rounded-xl bg-white py-2.5 ps-11 pe-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/60 sm:py-3 sm:text-base"
              />
              {draft && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft("");
                    setFilter("q", "");
                  }}
                  aria-label={t("browse.clearFilter")}
                  className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
              )}
            </label>
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 sm:py-3"
            >
              {t("common.search")}
            </button>
          </form>
        </div>
      </section>

      {/* Category chips */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-1 2xl:gap-2.5">
        {[{ value: "", icon: faBullhorn }, ...SERVICE_CATEGORIES].map((c) => {
          const on = category === c.value;
          return (
            <button
              key={c.value || "all"}
              type="button"
              onClick={() => setFilter("category", c.value)}
              aria-pressed={on}
              className={`inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition duration-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm 2xl:px-5 2xl:py-2.5 2xl:text-base ${
                on
                  ? "scale-105 bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:-translate-y-0.5 hover:ring-gray-400"
              }`}
            >
              <FontAwesomeIcon
                icon={c.icon}
                className="text-[10px] sm:text-xs 2xl:text-sm"
              />
              <span className="whitespace-nowrap">
                {c.value
                  ? t(`services.category.${c.value}`)
                  : t("campaigns.allCategories")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <select
            aria-label={t("campaigns.fields.country")}
            value={country}
            onChange={(e) => setFilter("country", e.target.value)}
            className={`${selectClass} w-full sm:w-auto 2xl:px-4 2xl:py-2.5 2xl:text-base`}
          >
            <option value="">{t("campaigns.allCountries")}</option>
            {COUNTRY_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {countryName(code)}
              </option>
            ))}
          </select>
          {data && (
            <p className="text-xs text-gray-600 sm:text-sm 2xl:text-base">
              <span className="font-display text-base font-bold text-gray-900 sm:text-lg 2xl:text-xl">
                <CountUp value={total} />
              </span>{" "}
              {t("campaigns.count", { count: total })}
            </p>
          )}
        </div>
        {data && data.items.length > 0 && (
          <div className="self-start sm:self-auto">{postButton}</div>
        )}
      </div>

      {results}

      {/* How applying works */}
      <section className="pt-8 sm:pt-10 2xl:pt-14">
        <Reveal className="mx-auto max-w-2xl text-center 2xl:max-w-3xl">
          <h2 className="font-display text-xl font-bold sm:text-2xl md:text-3xl 2xl:text-4xl">
            {t("campaigns.howTitle", {
              defaultValue: "From open call to signed deal",
            })}
          </h2>
        </Reveal>
        <ol className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3 2xl:gap-8">
          {[
            [
              faMagnifyingGlass,
              t("campaigns.how1", {
                defaultValue: "Find a campaign that fits",
              }),
              t("campaigns.how1Body", {
                defaultValue:
                  "Filter by category and country, then read the brief and budget.",
              }),
            ],
            [
              faPaperPlane,
              t("campaigns.how2", { defaultValue: "Send your application" }),
              t("campaigns.how2Body", {
                defaultValue:
                  "Pitch with your profile. The business sees your reach and reviews.",
              }),
            ],
            [
              faHandshake,
              t("campaigns.how3", { defaultValue: "Get selected and sign" }),
              t("campaigns.how3Body", {
                defaultValue:
                  "A hire request opens, then an agreement with milestones.",
              }),
            ],
          ].map(([icon, title, body], i) => (
            <li key={String(title)}>
              <Reveal delay={i * 150} className="h-full">
                <div className="h-full rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:rounded-3xl sm:p-6 2xl:p-8">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-base text-white sm:h-14 sm:w-14 sm:rounded-2xl sm:text-lg 2xl:h-16 2xl:w-16 2xl:text-xl">
                    <FontAwesomeIcon icon={icon as typeof faBullhorn} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold sm:text-lg 2xl:text-xl">
                    {String(title)}
                  </h3>
                  <p className="mt-1.5 text-xs text-gray-600 sm:text-sm 2xl:mt-2 2xl:text-base">
                    {String(body)}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Call to action for businesses */}
      {postButton && (
        <Reveal>
          <section className="keep-dark relative isolate overflow-hidden rounded-2xl bg-brand-plum px-4 py-8 text-center text-white sm:rounded-3xl sm:px-6 sm:py-10 md:px-12 md:py-14 2xl:px-16 2xl:py-20">
            <div className="absolute -start-16 -top-20 -z-10 h-72 w-72 animate-drift rounded-full bg-white/10 blur-3xl 2xl:h-96 2xl:w-96" />
            <div
              className="absolute -bottom-24 end-0 -z-10 h-72 w-72 animate-drift rounded-full bg-gray-400/20 blur-3xl 2xl:h-96 2xl:w-96"
              style={{ animationDelay: "-8s" }}
            />
            <h2 className="font-display text-xl font-bold sm:text-2xl md:text-4xl 2xl:text-5xl">
              {t("campaigns.ctaTitle", {
                defaultValue: "Have a project? Let talent come to you.",
              })}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs text-white/75 sm:text-sm md:text-base 2xl:mt-4 2xl:max-w-2xl 2xl:text-lg">
              {t("campaigns.ctaBody", {
                defaultValue:
                  "Post an open call once and review applications from verified creators.",
              })}
            </p>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-2 [&_a]:justify-center [&_a]:bg-white [&_a]:text-gray-900 [&_a:hover]:scale-105 [&_a:hover]:bg-gray-100 sm:flex-row sm:items-center 2xl:mt-8">
              {postButton}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}

export default CampaignsPage;