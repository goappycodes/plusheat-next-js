/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { GOOGLE_REVIEWS_URL, TRUSTPILOT_URL } from "@/lib/site";

export interface HeroReview {
  title: string;
  text: string;
  href: string;
}

export interface HeroProps {
  accent: string;
  rest: string;
  subtitle: string;
  button: { label: string; href: string };
  image: { src: string; alt: string; width: number; height: number };
  reviews?: HeroReview[];
  /** White Fade switched off (home page) */
  noOverlay?: boolean;
  /** Mobile crop: zoom and focal point, Desktop Focus Y (hero ACF fields) */
  mobileZoom?: number;
  focusX?: string;
  focusY?: string;
  desktopY?: string;
}

export const DEFAULT_REVIEWS: HeroReview[] = [
  {
    title: "Best value on the market",
    text: "Plus Heat was the best well rated and best value contract on the market",
    href: "https://uk.trustpilot.com/reviews/6a59ed2b7986c831473a6113",
  },
  {
    title: "Always on time!",
    text: "Always on time with work as agreed",
    href: "https://uk.trustpilot.com/reviews/6863e805e58bb794c97979ac",
  },
];

function StarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
    </svg>
  );
}

/** template-parts/sections/hero.php (layout: hero) */
export function Hero({
  accent,
  rest,
  subtitle,
  button,
  image,
  reviews = DEFAULT_REVIEWS,
  noOverlay = false,
  mobileZoom = 1.65,
  focusX = "69.4%",
  focusY = "19.6%",
  desktopY = "30%",
}: HeroProps) {
  const vars = {
    "--hero-mobile-zoom": mobileZoom,
    "--hero-focus-x": focusX,
    "--hero-focus-y": focusY,
    "--hero-desktop-y": desktopY,
  } as React.CSSProperties;

  return (
    <section
      style={vars}
      className={`ph-hero relative isolate overflow-hidden bg-white min-[992px]:flex min-[992px]:min-h-[max(680px,35.4vw)] min-[992px]:items-center min-[992px]:max-[1279px]:min-h-[600px] min-[1024px]:-mt-[78px] min-[1024px]:pt-[78px] ${
        noOverlay ? "ph-hero--no-overlay" : ""
      }`}
    >
      <div className="container-ph relative z-[2] min-[992px]:my-12 min-[992px]:w-full">
        <div className="max-w-none pb-14 pt-8 min-[769px]:pb-8 min-[769px]:pt-12 min-[992px]:max-w-[min(38rem,44vw)] min-[992px]:pb-36 min-[992px]:pt-16 min-[992px]:max-[1279px]:max-w-[37vw] min-[992px]:max-[1279px]:pb-20 min-[992px]:max-[1279px]:pt-14">
          <h1 className="mb-4 mt-0 text-[32px] font-semibold leading-[1.125] text-heading min-[769px]:mb-5 min-[769px]:text-[2.875rem] min-[769px]:leading-[1.1] min-[992px]:text-[3rem] min-[1280px]:text-[3.75rem]">
            <span className="text-primary">{accent}</span> <span>{rest}</span>
          </h1>
          <p className="mb-8 mt-0 max-w-none text-[16px] leading-[1.625] text-heading min-[769px]:text-[1.125rem] min-[769px]:leading-[1.5] min-[992px]:max-w-[32rem]">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={button.href}
              className="block flex-[1_1_100%] rounded-2xl bg-button px-6 py-[1.0625rem] text-center text-[18px] font-medium leading-none text-white transition-colors hover:bg-grey-dark min-[769px]:inline-block min-[769px]:flex-none min-[769px]:px-8 min-[769px]:pb-[1.125rem] min-[769px]:pt-4 min-[769px]:text-[1.25rem]"
            >
              {button.label}
            </a>
          </div>
          <ul className="m-0 mt-6 flex list-none flex-col items-start gap-2 p-0 min-[769px]:gap-3">
            <li>
              <a href={TRUSTPILOT_URL} target="_blank" rel="noopener" className="flex items-center gap-2">
                <img src="/images/logo-black.svg" alt="Trustpilot" width={99} height={24} className="relative -top-[2px] h-6 w-auto" />
                <span className="font-roboto text-[16px] text-heading">
                  <img src="/images/star.svg" alt="" aria-hidden="true" className="mr-[0.1em] inline-block h-5 w-5 align-[-3px]" />
                  4.7
                </span>
                <span className="font-roboto text-[16px] uppercase tracking-[0.02em] text-heading">18K+ reviews</span>
              </a>
            </li>
            <li>
              <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener" className="flex items-center gap-2">
                <img src="/images/image-13.png" alt="Google" width={20} height={20} className="h-6 w-auto" />
                <span className="font-roboto text-[16px] text-heading">
                  <span aria-hidden="true" className="mr-[0.1em]">
                    &#9733;
                  </span>
                  4.6
                </span>
                <span className="font-roboto text-[16px] uppercase tracking-[0.02em] text-heading">3K+ reviews</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="ph-hero__media relative z-0 -mt-[120px] aspect-[375/260] overflow-hidden min-[769px]:-mt-24 min-[992px]:absolute min-[992px]:inset-0 min-[992px]:z-[1] min-[992px]:mt-0 min-[992px]:aspect-auto min-[1024px]:top-4">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority
          sizes="100vw"
          className="ph-hero__img absolute inset-0 h-full w-full max-w-none object-cover"
        />
      </div>

      {reviews.length > 0 && (
        <div className="ph-hero__reviews hidden">
          {reviews.map((r, i) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener"
              className={`box-border flex min-h-[104px] w-[318px] overflow-hidden rounded-[24px] border-2 border-primary bg-white shadow-[var(--shadow-review)] ${
                i % 2 === 0 ? "ml-16" : ""
              } ${i > 0 ? "-mt-10" : ""}`}
            >
              <div className="flex flex-[0_0_64px] flex-col items-center justify-center gap-2 bg-primary text-white">
                <StarIcon />
                <span className="text-[14px] leading-none tracking-[0.02em]">5 / 5</span>
              </div>
              <div className="flex flex-col justify-center gap-1 p-4">
                <p className="m-0 text-[16px] font-semibold leading-[1.3] text-heading">{r.title}</p>
                <p className="m-0 text-[14px] leading-[1.5] text-heading">{r.text}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
