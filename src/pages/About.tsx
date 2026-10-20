import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBell,
  faBookmark,
  faBriefcase,
  faBuilding,
  faBullhorn,
  faChartLine,
  faCircleCheck,
  faEye,
  faFileSignature,
  faHandshake,
  faIdBadge,
  faLanguage,
  faLock,
  faMagnifyingGlass,
  faPlus,
  faShieldHalved,
  faStar,
  faTags,
  faUserCheck,
  faUserTie,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { peopleQuery } from "../api/queries";
import {
  CountUp,
  Photo,
  PlatformStrip,
  Reveal,
} from "../components/home/HomeSections";
import { useAuth } from "../hooks/useAuth";
import { useTaxonomy } from "../hooks/useTaxonomy";
// import type { PersonSummary } from "../types/person";

// Upar wale card ki tasveer (Unsplash, Home hero wali mein se ek)
const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80";
// Statement band picture (tried in order; if none loads the dark band stays)
const BAND_IMAGES = [
  "photo-1470229722913-7c0e2dbbafd3",
  "photo-1429962714451-bb934ecdc4ec",
].map(
  (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=75`,
);

const FAQ_COUNT = 7;
const glow = "absolute -z-10 animate-drift rounded-full blur-3xl";

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <h2 className="font-display text-2xl font-bold md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-sm text-gray-500 md:text-base">{sub}</p>}
    </Reveal>
  );
}

// Slowly scrolling row of portrait tiles
// function FaceRow({
//   people,
//   reverse,
// }: {
//   people: PersonSummary[];
//   reverse?: boolean;
// }) {
//   const base =
//     people.length >= 8 ? people : [...people, ...people, ...people].slice(0, 8);
//   return (
//     <div className="group overflow-hidden">
//       <div
//         className={`flex w-max animate-marquee gap-4 ${
//           reverse ? "[animation-direction:reverse]" : ""
//         }`}
//       >
//         {[...base, ...base].map((p, i) => (
//           <Link
//             key={`${p._id}-${i}`}
//             to={`/people/${p.slug}`}
//             aria-hidden={i >= base.length}
//             tabIndex={i >= base.length ? -1 : 0}
//             className="keep-dark group/tile relative block aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl bg-brand-plum text-white shadow-md md:w-48"
//           >
//             <Photo
//               person={p}
//               className="h-full w-full transition duration-700 group-hover/tile:scale-110"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
//             <p className="absolute inset-x-0 bottom-0 truncate p-3 text-sm font-semibold">
//               {p.name}
//             </p>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

// About: platform kya hai, kaise chalta hai, kis ke liye hai aur is mein kya kya hai
function About() {
  const { t } = useTranslation();
  const d = (key: string, defaultValue: string) => t(key, { defaultValue });
  const { user } = useAuth();
  const [bandIndex, setBandIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const { data: industries } = useTaxonomy("industries");
  const { data: professions } = useTaxonomy("professions");
  const { data: peopleData } = useQuery(
    peopleQuery(new URLSearchParams({ limit: "12", sort: "followers" })),
  );
  const faces = peopleData?.people ?? [];

  const stats: { icon: IconDefinition; value: number; label: string }[] = [
    {
      icon: faUsers,
      value: peopleData?.meta.total ?? 0,
      label: t("home.statProfiles"),
    },
    {
      icon: faBriefcase,
      value: industries?.length ?? 0,
      label: t("home.statIndustries"),
    },
    {
      icon: faIdBadge,
      value: professions?.length ?? 0,
      label: t("home.statProfessions"),
    },
    { icon: faLanguage, value: 3, label: t("home.statLanguages") },
  ];

  const stepIcons = [faMagnifyingGlass, faHandshake, faFileSignature, faStar];
  const steps = [1, 2, 3, 4].map((n, i) => ({
    icon: stepIcons[i],
    title: t(`about.step${n}Title`),
    body: t(`about.step${n}Body`),
  }));

  const featureDefs: [string, IconDefinition][] = [
    ["search", faMagnifyingGlass],
    ["claim", faIdBadge],
    ["services", faTags],
    ["hire", faHandshake],
    ["campaigns", faBullhorn],
    ["agreements", faFileSignature],
    ["reviews", faStar],
    ["managers", faUserTie],
    ["businesses", faBuilding],
    ["shortlists", faBookmark],
    ["notifications", faBell],
    ["safety", faShieldHalved],
  ];

  const values: { icon: IconDefinition; title: string; body: string }[] = [
    {
      icon: faChartLine,
      title: t("about.value1Title"),
      body: t("about.value1Body"),
    },
    {
      icon: faUserCheck,
      title: t("about.value2Title"),
      body: t("about.value2Body"),
    },
    {
      icon: faLock,
      title: t("about.value3Title"),
      body: t("about.value3Body"),
    },
    {
      icon: faLanguage,
      title: t("about.value4Title"),
      body: t("about.value4Body"),
    },
  ];

  // Teen qism ke account: har ek ke apne fayde aur signup ka seedha raasta
  const audiences: { key: string; icon: IconDefinition; type: string }[] = [
    { key: "talent", icon: faStar, type: "talent" },
    { key: "manager", icon: faUserTie, type: "representative" },
    { key: "business", icon: faBuilding, type: "business" },
  ];

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`about.faq${i + 1}Q`),
    a: t(`about.faq${i + 1}A`),
  }));

  return (
    <div className="space-y-20 overflow-x-clip md:space-y-28">
      {/* Hero: same picture as before, now with motion */}
      <section className="keep-dark relative isolate overflow-hidden rounded-3xl bg-gray-900 px-5 py-14 text-white sm:px-10 md:py-24">
        <img
          src={ABOUT_IMAGE}
          alt=""
          decoding="async"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="absolute inset-0 -z-10 h-full w-full animate-[fade_1.2s_ease-out_both] object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-950/95 via-gray-950/75 to-gray-950/25 rtl:bg-gradient-to-l" />
        <div className={`${glow} -start-16 -top-20 h-72 w-72 bg-white/10`} />
        <div className="max-w-2xl">
          <p className="animate-word text-xs font-medium tracking-wider text-white/60 uppercase">
            {t("about.eyebrow")}
          </p>
          <h1
            className="mt-3 animate-word text-3xl leading-tight font-extrabold tracking-tight md:text-5xl"
            style={{ animationDelay: "120ms" }}
          >
            {t("about.title")}
          </h1>
          <p
            className="mt-4 animate-word text-sm leading-relaxed text-white/80 md:text-lg"
            style={{ animationDelay: "260ms" }}
          >
            {t("about.subtitle")}
          </p>
          <div
            className="mt-7 flex flex-wrap gap-3 animate-word"
            style={{ animationDelay: "400ms" }}
          >
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:scale-105"
            >
              {t("about.ctaExplore")}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs rtl:rotate-180"
              />
            </Link>
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white ring-1 ring-white/30 transition hover:bg-white/10"
            >
              {t("about.ctaCampaigns")}
            </Link>
          </div>
        </div>
      </section>

      {/* Numbers card overlapping the hero */}
      <div className="relative z-10 -mt-32 px-2 md:-mt-36 md:px-8">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-gray-200 shadow-xl ring-1 ring-gray-200 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse gap-1 bg-white p-5 md:p-6"
              >
                <dt className="flex items-center gap-1.5 text-xs text-gray-500 md:text-sm">
                  <FontAwesomeIcon
                    icon={stat.icon}
                    className="text-[11px] text-gray-400"
                  />
                  {stat.label}
                </dt>
                <dd className="font-display text-3xl font-extrabold text-gray-900 md:text-4xl">
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* Mission + faces */}
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-2xl font-bold md:text-4xl">
            {t("about.missionTitle")}
          </h2>
          <p className="mt-5 leading-relaxed text-gray-600">
            {t("about.mission1")}
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            {t("about.mission2")}
          </p>
        </Reveal>
        {faces.length >= 3 && (
          <Reveal delay={150} className="mx-auto w-full max-w-md">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {faces.slice(0, 3).map((p, i) => (
                <Link
                  key={p._id}
                  to={`/people/${p.slug}`}
                  style={{ animationDelay: `${i * -2.2}s` }}
                  className={`relative block animate-float overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white ${["mt-8 aspect-[3/4]", "", "mt-12 aspect-[3/4]"][i]
                    }`}
                >
                  <Photo person={p} className="absolute inset-0 h-full w-full" />
                </Link>
              ))}
            </div>
            <div className="mx-auto mt-8 w-fit rounded-2xl bg-gray-900 px-6 py-3 text-center text-white shadow-xl">
              <p className="font-display text-2xl leading-none font-extrabold">
                <CountUp value={peopleData?.meta.total ?? 0} />
              </p>
              <p className="mt-1 text-xs text-white/70">
                {t("home.statProfiles")}
              </p>
            </div>
          </Reveal>
        )}
      </section>

      {/* How it works */}
      {/* How it works */}
      <section>
        <Heading title={t('about.howTitle')} sub={t('about.howSubtitle')} />
        <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* ✅ Line — cards ke vertical center par, peeche */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[12%] top-1/2 -z-10 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-gray-900 via-gray-400 to-gray-900 lg:block"
          />
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <Reveal delay={i * 150} className="h-full">
                <div className="relative h-full rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-lg text-white shadow-lg">
                    <FontAwesomeIcon icon={step.icon} />
                  </span>
                  <p className="mt-3 text-xs font-semibold tracking-wider text-gray-400">
                    0{i + 1}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Statement band with a picture */}
      <Reveal>
        <section className="keep-dark relative isolate overflow-hidden rounded-3xl bg-brand-plum px-6 py-16 text-center text-white md:py-24">
          {bandIndex < BAND_IMAGES.length && (
            <img
              key={bandIndex}
              src={BAND_IMAGES[bandIndex]}
              alt=""
              decoding="async"
              loading="lazy"
              onError={() => setBandIndex((i) => i + 1)}
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
            />
          )}
          <div className={`${glow} -start-20 -top-24 h-80 w-80 bg-white/10`} />
          <div
            className={`${glow} -bottom-24 end-0 h-80 w-80 bg-gray-400/20`}
            style={{ animationDelay: "-8s" }}
          />
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold leading-tight md:text-6xl">
            {d("about.band", "Real reach. Real people. Real agreements.")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/75">
            {d(
              "about.bandBody",
              "No guesswork and no screenshots of chats. Everything is checked, written down and signed.",
            )}
          </p>
        </section>
      </Reveal>

      {/* Everything on the platform */}
      <section>
        <Heading
          title={t("about.featuresTitle")}
          sub={t("about.featuresSubtitle")}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureDefs.map(([key, icon], i) => (
            <Reveal key={key} delay={(i % 3) * 90} className="h-full">
              <div className="group h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-gray-300">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <FontAwesomeIcon icon={icon} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">
                  {t(`about.features.${key}Title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  {t(`about.features.${key}Body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* People already here
      {faces.length > 0 && (
        <section className="space-y-4">
          <Heading title={d("about.peopleTitle", "Already on the platform")} />
          <div className="pt-6">
            <FaceRow people={faces} />
          </div>
          <FaceRow people={[...faces].reverse()} reverse />
        </section>
      )} */}

      {/* Kis ke liye: teen account types */}
      <section>
        <Heading title={t("about.forTitle")} />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {audiences.map((audience, i) => {
            const dark = i === 1;
            return (
              <Reveal key={audience.key} delay={i * 120} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-3xl p-6 transition duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-8 ${dark
                      ? "keep-dark bg-gray-900 text-white"
                      : "bg-white shadow-sm ring-1 ring-gray-100"
                    }`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${dark ? "bg-white text-gray-900" : "bg-gray-900 text-white"
                      }`}
                  >
                    <FontAwesomeIcon icon={audience.icon} />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold">
                    {t(`about.for.${audience.key}Title`)}
                  </h3>
                  <ul className="mt-5 flex-1 space-y-3">
                    {[1, 2, 3, 4].map((n) => (
                      <li
                        key={n}
                        className="flex gap-3 text-sm leading-relaxed"
                      >
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className={`mt-1 shrink-0 ${dark ? "text-emerald-400" : "text-emerald-600"}`}
                        />
                        <span
                          className={dark ? "text-white/80" : "text-gray-600"}
                        >
                          {t(`about.for.${audience.key}${n}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!user && (
                    <Link
                      to={`/register?type=${audience.type}`}
                      className={`mt-6 inline-flex items-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-medium transition hover:scale-105 ${dark
                          ? "bg-white text-gray-900 hover:bg-gray-100"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                    >
                      {t(`about.for.${audience.key}Join`)}
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-xs rtl:rotate-180"
                      />
                    </Link>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Usool */}
      <section>
        <Heading
          title={t("about.valuesTitle")}
          sub={t("about.valuesSubtitle")}
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => (
            <li key={value.title}>
              <Reveal delay={i * 100} className="h-full">
                <div className="group h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <FontAwesomeIcon icon={value.icon} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">
                    {value.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                    {value.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <PlatformStrip />

      {/* Aksar pooche jane wale sawal */}
      <section className="mx-auto max-w-3xl">
        <Heading title={t("about.faqTitle")} />
        <div className="mt-8 space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 50}>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <button
                  type="button"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-start font-semibold"
                >
                  {faq.q}
                  <FontAwesomeIcon
                    icon={faPlus}
                    className={`shrink-0 text-gray-900 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                  <p className="overflow-hidden px-5 text-sm leading-relaxed text-gray-600">
                    <span className="block pb-5">{faq.a}</span>
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Aakhri dawat */}
      <Reveal>
        <section className="keep-dark relative isolate flex flex-col items-center gap-7 overflow-hidden rounded-3xl bg-brand-plum p-6 text-center text-white md:p-12">
          <div className={`${glow} -start-16 -top-20 h-72 w-72 bg-white/10`} />
          <div
            className={`${glow} -bottom-24 end-0 h-72 w-72 bg-gray-400/20`}
            style={{ animationDelay: "-8s" }}
          />
          <div className="max-w-2xl">
            <p className="flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-white/60 uppercase">
              <FontAwesomeIcon icon={faEye} />
              {t("about.ctaEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
              {t("about.ctaTitle")}
            </h2>
            <p className="mt-2 text-sm text-white/75">{t("about.ctaBody")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:flex-nowrap">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:scale-105"
            >
              {t("about.ctaExplore")}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs rtl:rotate-180"
              />
            </Link>
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium text-white ring-1 ring-white/30 transition hover:bg-white/10"
            >
              {t("about.ctaCampaigns")}
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium text-white ring-1 ring-white/30 transition hover:bg-white/10"
              >
                {t("about.ctaJoin")}
              </Link>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

export default About;