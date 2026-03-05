import { MetadataRoute } from 'next';

const baseUrl = 'https://mimo-flame.vercel.app';
const apiUrl = 'https://mimo-back.vercel.app';
const locales = ['ar', 'en'];

type Package = {
  _id: string;
  'name-ar': string;
  'name-en': string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/booking/non', '/terms', '/privacy'];

  // 1. Generate static routes for each locale
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  // 2. Fetch dynamic packages to include in sitemap
  try {
    const res = await fetch(`${apiUrl}/api/home/packages`, {
      headers: { 'lang': 'ar' },
      next: { revalidate: 3600 } 
    });

    if (res.ok) {
      const packages: Package[] = await res.json();
      
      for (const locale of locales) {
        for (const pkg of packages) {
          const name = locale === 'ar' ? pkg['name-ar'] : pkg['name-en'];
          // Slug format logic from package details page: slug-id
          const slug = `${name.replace(/\s+/g, '-').toLowerCase()}-${pkg._id}`;
          
          sitemapEntries.push({
            url: `${baseUrl}/${locale}/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch packages for sitemap:', error);
  }

  return sitemapEntries;
}
