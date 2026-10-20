import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBolt,
  faCalendarDays,
  faCircleCheck,
  faEarthAsia,
  faLocationDot,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { categoryIcon } from "../../constants/services";
import type { Campaign } from "../../types/campaign";
import { countryName, initials } from "../../utils/format";
import { CampaignBusiness } from "../../components/campaigns/campaignUi";
import { useCampaignFormat } from "../../components/campaigns/campaignFormat";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, seen] as const;
}

// Whole days until the deadline (null when there is none)
function useDaysLeft(deadline?: string) {
  const [now] = useState(() => Date.now());
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - now) / 86400000);
}

function useDaysLabel(days: number | null) {
  const { t } = useTranslation();
  if (days === null || days < 0) return null;
  if (days === 0) return t("campaigns.lastDay");
  if (days === 1) return t("campaigns.oneDayLeft");
  return t("campaigns.daysLeft", { days });
}

// Bar that fills when it scrolls into view
function Fill({
  done,
  total,
  dark,
}: {
  done: number;
  total: number;
  dark?: boolean;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const percent =
    total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div
      ref={ref}
      className={`h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-gray-100"}`}
    >
      <div
        style={{
          width: seen ? `${Math.max(percent, done > 0 ? 6 : 0)}%` : "0%",
        }}
        className={`h-full rounded-full transition-[width] duration-[1400ms] ease-out ${dark ? "bg-white" : "bg-gray-900"}`}
      />
    </div>
  );
}

// Normal card in the grid
export function CampaignTile({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation();
  const format = useCampaignFormat();
  const days = useDaysLeft(campaign.deadline);
  const daysLabel = useDaysLabel(days);
  const urgent = days !== null && days >= 0 && days <= 3;
  const { applications, accepted } = campaign.counts;

  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-gray-300"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gray-900 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
      <div className="flex items-start justify-between gap-3">
        <CampaignBusiness campaign={campaign} />
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          <FontAwesomeIcon
            icon={categoryIcon(campaign.category)}
            className="text-[10px]"
          />
          {t(`services.category.${campaign.category}`)}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-bold leading-snug text-gray-900">
        {campaign.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-sm text-gray-600">
        {campaign.brief}
      </p>

      <div className="mt-auto pt-5">
        <p className="font-display text-2xl font-extrabold text-gray-900">
          {format.budget(campaign) ?? t("campaigns.budgetOpen")}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1">
            <FontAwesomeIcon
              icon={campaign.country ? faLocationDot : faEarthAsia}
              className="text-gray-400"
            />
            {campaign.country
              ? countryName(campaign.country)
              : t("campaigns.anyCountry")}
          </span>
          {daysLabel && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                urgent
                  ? "bg-amber-100 font-semibold text-amber-800"
                  : "bg-gray-100"
              }`}
            >
              <FontAwesomeIcon
                icon={urgent ? faBolt : faCalendarDays}
                className={urgent ? "" : "text-gray-400"}
              />
              {daysLabel}
            </span>
          )}
        </div>

        <div className="mt-4">
          <Fill done={accepted} total={campaign.slots} />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
            <span>{t("campaigns.applied", { count: applications })}</span>
            <span className="inline-flex items-center gap-1.5">
              <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
              {accepted}/{campaign.slots}
            </span>
          </div>
        </div>

        <span className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-gray-900">
          {t("campaigns.viewDetails")}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs transition duration-300 group-hover:translate-x-1 group-hover:bg-gray-900 group-hover:text-white rtl:group-hover:-translate-x-1">
            <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
          </span>
        </span>
      </div>
    </Link>
  );
}

// Wide dark card for the first campaign
export function CampaignSpotlight({ campaign }: { campaign: Campaign }) {
  const { t } = useTranslation();
  const format = useCampaignFormat();
  const days = useDaysLeft(campaign.deadline);
  const daysLabel = useDaysLabel(days);
  const business = campaign.business;
  const { applications, accepted } = campaign.counts;
  const chip =
    "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs ring-1 ring-white/15";

  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="group keep-dark relative isolate block overflow-hidden rounded-3xl bg-brand-plum p-6 text-white shadow-lg transition duration-500 hover:shadow-2xl md:p-9"
    >
      <div className="absolute -start-16 -top-20 -z-10 h-72 w-72 animate-drift rounded-full bg-white/10 blur-3xl" />
      <div
        className="absolute -bottom-24 end-0 -z-10 h-72 w-72 animate-drift rounded-full bg-gray-400/20 blur-3xl"
        style={{ animationDelay: "-8s" }}
      />
      <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900">
            <FontAwesomeIcon icon={faBolt} />
            {t("campaigns.spotlight")}
          </span>
          {business && (
            <p className="mt-5 flex items-center gap-3 text-sm text-white/80">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt=""
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/20"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xs font-semibold">
                  {initials(business.name)}
                </span>
              )}
              <span className="font-semibold text-white">{business.name}</span>
              {business.verified && (
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-sky-300"
                />
              )}
            </p>
          )}
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-4xl">
            {campaign.title}
          </h2>
          <p className="mt-3 line-clamp-3 max-w-xl text-white/75">
            {campaign.brief}
          </p>
        </div>

        <div className="space-y-4 md:text-end">
          <p className="font-display text-4xl font-extrabold md:text-5xl">
            {format.budget(campaign) ?? t("campaigns.budgetOpen")}
          </p>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <span className={chip}>
              <FontAwesomeIcon
                icon={campaign.country ? faLocationDot : faEarthAsia}
              />
              {campaign.country
                ? countryName(campaign.country)
                : t("campaigns.anyCountry")}
            </span>
            {daysLabel && (
              <span className={chip}>
                <FontAwesomeIcon icon={faCalendarDays} />
                {daysLabel}
              </span>
            )}
          </div>
          <div>
            <Fill done={accepted} total={campaign.slots} dark />
            <p className="mt-2 text-xs text-white/65">
              {t("campaigns.applied", { count: applications })} · {accepted}/
              {campaign.slots}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition group-hover:scale-105">
            {t("campaigns.viewDetails")}
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-xs transition group-hover:translate-x-1 rtl:rotate-180"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}