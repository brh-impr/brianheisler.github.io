import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import Papa from "papaparse";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function readYamlFile<T>(relativePath: string): T {
  const fullPath = path.join(CONTENT_ROOT, relativePath);
  const raw = readFile(fullPath);
  return yaml.load(raw) as T;
}

function readMarkdownFile<T>(relativePath: string): { data: T; content: string } {
  const fullPath = path.join(CONTENT_ROOT, relativePath);
  const raw = readFile(fullPath);
  const parsed = matter(raw);
  return {
    data: parsed.data as T,
    content: parsed.content,
  };
}

function getFilesFromDir(relativeDir: string, extensions?: string[]): string[] {
  const fullDir = path.join(CONTENT_ROOT, relativeDir);

  if (!fs.existsSync(fullDir)) return [];

  return fs
    .readdirSync(fullDir)
    .filter((file) => {
      if (!extensions || extensions.length === 0) return true;
      return extensions.some((ext) => file.toLowerCase().endsWith(ext.toLowerCase()));
    })
    .sort();
}

/* =========================
   Types
   ========================= */

export type SiteSettings = {
  site_name: string;
  site_url: string;
  site_description?: string;
  contact_email: string;
  recruiting_email?: string;
  instagram_url?: string;
  youtube_url?: string;
  x_url?: string;
  home_rink?: string;
  club_disclaimer: string;
  logo?: string;
};

export type HomepageStat = {
  label: string;
  value: string;
};

export type HomepageSettings = {
  hero_eyebrow: string;
  hero_title: string;
  hero_text: string;
  hero_image?: string;
  featured_stats: HomepageStat[];
  primary_cta_label: string;
  primary_cta_link: string;
  secondary_cta_label: string;
  secondary_cta_link: string;
};

export type ScheduleGame = {
  opponent: string;
  date: string;
  time: string;
  location: "Home" | "Away" | "Neutral";
  rink: string;
  result?: string;
  livestream_url?: string;
  ticket_url?: string;
};

export type ScheduleData = {
  games: ScheduleGame[];
};

export type StoreProduct = {
  name: string;
  slug: string;
  price: string;
  image?: string;
  buy_url?: string;
};

export type StoreData = {
  products: StoreProduct[];
};

export type Player = {
  name: string;
  slug: string;
  number: number;
  position: "F" | "D" | "G";
  year: string;
  hometown: string;
  shoots?: string;
  previous_team?: string;
  major?: string;
  image?: string;
  bio?: string;
};

export type EventItem = {
  title: string;
  slug: string;
  date: string;
  location: string;
  price?: string;
  registration_open?: boolean;
  registration_url?: string;
  image?: string;
  description: string;
};

export type NewsFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  featured_image?: string;
  published?: boolean;
};

export type NewsPost = NewsFrontmatter & {
  slug: string;
  body: string;
};

export type PageFrontmatter = {
  title: string;
  hero_title?: string;
  hero_image?: string;
  contact_email?: string;
};

export type ContentPage = PageFrontmatter & {
  slug: string;
  body: string;
};

/* =========================
   Single files
   ========================= */

export function getSiteSettings(): SiteSettings {
  return readYamlFile<SiteSettings>("settings/site.yml");
}

export function getHomepageSettings(): HomepageSettings {
  return readYamlFile<HomepageSettings>("settings/homepage.yml");
}

export function getSchedule(): ScheduleData {
  return readYamlFile<ScheduleData>("data/schedule.yml");
}

export function getStore(): StoreData {
  return readYamlFile<StoreData>("data/store.yml");
}

/* =========================
   Players
   ========================= */

export function getAllPlayers(): Player[] {
  const files = getFilesFromDir("players", [".yml", ".yaml"]);

  return files.map((file) => {
    const relativePath = path.join("players", file);
    return readYamlFile<Player>(relativePath);
  });
}

export function getPlayerBySlug(slug: string): Player | null {
  const players = getAllPlayers();
  return players.find((player) => player.slug === slug) ?? null;
}

/* =========================
   Events
   ========================= */

export function getAllEvents(): EventItem[] {
  const files = getFilesFromDir("events", [".yml", ".yaml"]);

  return files.map((file) => {
    const relativePath = path.join("events", file);
    return readYamlFile<EventItem>(relativePath);
  });
}

export function getEventBySlug(slug: string): EventItem | null {
  const events = getAllEvents();
  return events.find((event) => event.slug === slug) ?? null;
}

/* =========================
   News
   ========================= */

export function getAllNews(): NewsPost[] {
  const files = getFilesFromDir("news", [".md", ".markdown"]);

  return files
    .map((file) => {
      const slug = file.replace(/\.(md|markdown)$/i, "");
      const { data, content } = readMarkdownFile<NewsFrontmatter>(path.join("news", file));

      return {
        slug,
        body: content,
        ...data,
      };
    })
    .filter((post) => post.published !== false)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNewsBySlug(slug: string): NewsPost | null {
  const filePath = path.join(CONTENT_ROOT, "news", `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const { data, content } = readMarkdownFile<NewsFrontmatter>(path.join("news", `${slug}.md`));

  if (data.published === false) return null;

  return {
    slug,
    body: content,
    ...data,
  };
}

/* =========================
   Standalone pages
   ========================= */

export function getPageBySlug(slug: string): ContentPage | null {
  const filePath = path.join(CONTENT_ROOT, "pages", `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const { data, content } = readMarkdownFile<PageFrontmatter>(path.join("pages", `${slug}.md`));

  return {
    slug,
    body: content,
    ...data,
  };
}

export function getAboutPage(): ContentPage | null {
  return getPageBySlug("about");
}

export function getRecruitingPage(): ContentPage | null {
  return getPageBySlug("recruiting");
}

export async function getScheduleFromSheet(): Promise<
  Array<ScheduleGame & { id: string }>
> {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSzKcL42kKLA681-_-upPJhPAV1cJ_U1DbhqD3jmjhLciDVXvE1oI7Cnuva9aSH7ONZ-sUciWes85dG/pub?gid=0&single=true&output=csv";

  const res = await fetch(url, { cache: "force-cache" });
  const text = await res.text();

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((game: any, index: number) => ({
    id: index.toString(),
    opponent: game.opponent,
    date: game.date,
    time: game.time,
    location: game.location,
    rink: game.rink,
    result: game.result || null,
  }));
}
