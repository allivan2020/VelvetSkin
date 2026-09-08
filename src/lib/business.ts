/** Canonical business NAP for Google Search / Maps / GBP. Keep in sync with profile. */
export const BUSINESS = {
  name: 'VelvetSkin',
  alternateName: 'Velvet Skin',
  baseUrl: 'https://www.velvetskinzp.com',
  phoneE164: '+380971950698',
  phoneDisplay: '+38 (097) 195 06 98',
  streetAddress: 'вул. Українська, 43',
  addressLocality: 'Запоріжжя',
  addressRegion: 'Запорізька область',
  postalCode: '69000',
  addressCountry: 'UA',
  /** Same street string for all locales — NAP consistency with Google. */
  addressDisplay: 'Запоріжжя, вул. Українська, 43',
  latitude: 47.83155,
  longitude: 35.15546,
  /** From Google Maps place hex 0x673070440628325b */
  mapsCid: '7435566422252073563',
  mapsUrl: 'https://www.google.com/maps?cid=7435566422252073563',
  opens: '08:00',
  closes: '19:00',
  instagram: 'https://www.instagram.com/velvetskin.zp/',
  telegram: 'https://t.me/velvetskinzp/',
  priceRange: '₴₴',
  ogImage: '/img/og-image.jpg',
  logo: '/img/icon-512x512.png',
  image: '/img/hero-poster.webp',
} as const;

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export function openingHoursSpecification() {
  return DAYS.map((dayOfWeek) => ({
    '@type': 'OpeningHoursSpecification' as const,
    dayOfWeek,
    opens: BUSINESS.opens,
    closes: BUSINESS.closes,
  }));
}

/** Locale-aware Maps embed for the studio pin. */
export function mapsEmbedUrl(locale: string): string {
  const hl = locale === 'en' ? 'en' : locale === 'ru' ? 'ru' : 'uk';
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2678.43573!2d35.15546!3d47.83155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40dc67389658e653%3A0x673070440628325b!2z0YPQuy4g0KPQutGA0LDQuNC90YHQutCw0Y8sIDQzLCDQl9Cw0L_QvtGA0L7QttGM0LUsINCX0LDQv9C-0YDQvtC20YHQutCw0Y8g0L7QsdC70LDRgdGC0YwsIDY5MDAw!5e0!3m2!1s${hl}!2sua!4v1715000000000!5m2!1s${hl}!2sua`;
}

export function beautySalonJsonLd(description: string) {
  const { baseUrl } = BUSINESS;
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${baseUrl}/#business`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    description,
    url: baseUrl,
    telephone: BUSINESS.phoneE164,
    image: [`${baseUrl}${BUSINESS.image}`, `${baseUrl}${BUSINESS.ogImage}`],
    logo: `${baseUrl}${BUSINESS.logo}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    hasMap: BUSINESS.mapsUrl,
    openingHoursSpecification: openingHoursSpecification(),
    sameAs: [BUSINESS.instagram, BUSINESS.telegram, BUSINESS.mapsUrl],
    priceRange: BUSINESS.priceRange,
    areaServed: {
      '@type': 'City',
      name: BUSINESS.addressLocality,
    },
  };
}
