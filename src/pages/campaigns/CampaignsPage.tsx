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
import {
  CampaignSpotlight,
  CampaignTile,
} from "./CampaignTile";
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

  // First campaign gets the big dark card (only on the plain first page)
  const spotlight =
    data && page === 1 && !filtered && data.items.length >= 3
      ? data.items[0]
      : null;
  const gridItems = data ? (spotlight ? data.items.slice(1) : data.items) : [];

  let results: ReactNode;
  if (isLoading) {
    results = (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-3xl bg-gray-200/70"
          />
        ))}
      </div>
    );
  } else if (isError) {
    results = (
      <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200/70">
        <p className="font-semibold">{t("common.error")}</p>
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
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <FontAwesomeIcon icon={filtered ? faMagnifyingGlass : faBullhorn} />
        </span>
        <p className="mt-4 font-semibold">
          {filtered ? t("campaigns.noMatch") : t("campaigns.emptyTitle")}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
          {filtered ? t("directory.noMatchHint") : t("campaigns.emptyText")}
        </p>
        {!filtered && postButton && <div className="mt-5">{postButton}</div>}
      </div>
    );
  } else {
    results = (
      <>
        {spotlight && (
          <Reveal className="mb-5">
            <CampaignSpotlight campaign={spotlight} />
          </Reveal>
        )}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {gridItems.map((campaign, i) => (
            <Reveal key={campaign._id} delay={(i % 3) * 90} className="h-full">
              <CampaignTile campaign={campaign} />
            </Reveal>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <section className="keep-dark relative isolate overflow-hidden rounded-3xl bg-gray-900 px-5 py-10 text-white sm:px-8 md:py-14">
        <img
          src={HEADER_IMAGE}
          alt=""
          decoding="async"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-950/95 via-gray-950/75 to-gray-950/25 rtl:bg-gradient-to-l" />
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-white/60 uppercase">
            <FontAwesomeIcon icon={faBullhorn} />
            {t("campaigns.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            {t("campaigns.title")}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {t("campaigns.subtitle")}
          </p>

          <form
            onSubmit={search}
            className="mt-5 flex max-w-lg gap-2"
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
                className="w-full rounded-xl bg-white py-3 ps-11 pe-10 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/60"
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
              className="rounded-xl bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              {t("common.search")}
            </button>
          </form>
        </div>
      </section>

      {/* Category chips */}
      <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ value: "", icon: faBullhorn }, ...SERVICE_CATEGORIES].map((c) => {
          const on = category === c.value;
          return (
            <button
              key={c.value || "all"}
              type="button"
              onClick={() => setFilter("category", c.value)}
              aria-pressed={on}
              className={`inline-flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                on
                  ? "scale-105 bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:-translate-y-0.5 hover:ring-gray-400"
              }`}
            >
              <FontAwesomeIcon icon={c.icon} className="text-xs" />
              {c.value
                ? t(`services.category.${c.value}`)
                : t("campaigns.allCategories")}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label={t("campaigns.fields.country")}
            value={country}
            onChange={(e) => setFilter("country", e.target.value)}
            className={selectClass}
          >
            <option value="">{t("campaigns.allCountries")}</option>
            {COUNTRY_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {countryName(code)}
              </option>
            ))}
          </select>
          {data && (
            <p className="text-sm text-gray-600">
              <span className="font-display text-lg font-bold text-gray-900">
                <CountUp value={total} />
              </span>{" "}
              {t("campaigns.count", { count: total })}
            </p>
          )}
        </div>
        {data && data.items.length > 0 && postButton}
      </div>

      {results}

      {/* How applying works */}
      <section className="pt-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            {t("campaigns.howTitle", {
              defaultValue: "From open call to signed deal",
            })}
          </h2>
        </Reveal>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
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
                <div className="h-full rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-lg text-white">
                    <FontAwesomeIcon icon={icon as typeof faBullhorn} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">
                    {String(title)}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-600">{String(body)}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Call to action for businesses */}
      {postButton && (
        <Reveal>
          <section className="keep-dark relative isolate overflow-hidden rounded-3xl bg-brand-plum px-6 py-10 text-center text-white md:px-12 md:py-14">
            <div className="absolute -start-16 -top-20 -z-10 h-72 w-72 animate-drift rounded-full bg-white/10 blur-3xl" />
            <div
              className="absolute -bottom-24 end-0 -z-10 h-72 w-72 animate-drift rounded-full bg-gray-400/20 blur-3xl"
              style={{ animationDelay: "-8s" }}
            />
            <h2 className="font-display text-2xl font-bold md:text-4xl">
              {t("campaigns.ctaTitle", {
                defaultValue: "Have a project? Let talent come to you.",
              })}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75">
              {t("campaigns.ctaBody", {
                defaultValue:
                  "Post an open call once and review applications from verified creators.",
              })}
            </p>
            <div className="mt-6 flex justify-center [&_a]:bg-white [&_a]:text-gray-900 [&_a:hover]:scale-105 [&_a:hover]:bg-gray-100">
              {postButton}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}

export default CampaignsPage;