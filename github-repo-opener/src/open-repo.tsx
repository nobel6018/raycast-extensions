import { ActionPanel, Action, List, getPreferenceValues, showToast, Toast, Icon, Cache, Color } from "@raycast/api";
import { useEffect, useState, useMemo, useCallback } from "react";

interface Repo {
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  html_url: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
}

interface Preferences {
  githubToken: string;
}

interface CacheData {
  repos: Repo[];
  timestamp: number;
}

const cache = new Cache();
const CACHE_KEY = "github-repos";
const FAVORITES_KEY = "github-favorites";
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function loadFavorites(): Set<string> {
  const raw = cache.get(FAVORITES_KEY);
  if (!raw) {
    return new Set();
  }
  try {
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<string>) {
  cache.set(FAVORITES_KEY, JSON.stringify([...favs]));
}

async function fetchAllRepos(token: string): Promise<Repo[]> {
  const allRepos: Repo[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const repos: Repo[] = await res.json();
    if (repos.length === 0) {
      break;
    }

    allRepos.push(...repos);
    page++;

    if (repos.length < 100) {
      break;
    }
  }

  return allRepos;
}

const LANGUAGE_COLORS: Record<string, Color> = {
  TypeScript: Color.Blue,
  JavaScript: Color.Yellow,
  Python: Color.Green,
  Go: Color.SecondaryText,
  Kotlin: Color.Purple,
  Java: Color.Orange,
  Rust: Color.Red,
  Swift: Color.Orange,
  Ruby: Color.Red,
};

export default function Command() {
  const { githubToken } = getPreferenceValues<Preferences>();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);

  async function loadRepos(skipCache = false) {
    setIsLoading(true);

    if (!skipCache) {
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        try {
          const data: CacheData = JSON.parse(cached);
          if (Date.now() - data.timestamp < CACHE_TTL) {
            setRepos(data.repos);
            setIsLoading(false);
            return;
          }
        } catch {
          // corrupted cache
        }
      }
    }

    try {
      const allRepos = await fetchAllRepos(githubToken);
      setRepos(allRepos);
      cache.set(CACHE_KEY, JSON.stringify({ repos: allRepos, timestamp: Date.now() }));
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch repos",
        message: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRepos();
  }, []);

  const toggleFavorite = useCallback((fullName: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) {
        next.delete(fullName);
      } else {
        next.add(fullName);
      }
      saveFavorites(next);
      return next;
    });
  }, []);

  const { favs, owned, contributed } = useMemo(() => {
    const favs: Repo[] = [];
    const owned: Repo[] = [];
    const contributed: Repo[] = [];
    for (const repo of repos) {
      if (favorites.has(repo.full_name)) {
        favs.push(repo);
      } else if (repo.owner.login === repos[0]?.owner.login && !repo.fork) {
        owned.push(repo);
      } else {
        contributed.push(repo);
      }
    }
    return { favs, owned, contributed };
  }, [repos, favorites]);

  function repoActions(repo: Repo) {
    const base = repo.html_url;
    const isFav = favorites.has(repo.full_name);
    return (
      <ActionPanel>
        <Action.OpenInBrowser
          title="Code"
          url={base}
          icon={Icon.Code}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
        />
        <Action.OpenInBrowser
          title="Pull Requests"
          url={`${base}/pulls`}
          icon={Icon.ArrowRightCircle}
          shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
        />
        <Action.OpenInBrowser
          title="Actions"
          url={`${base}/actions`}
          icon={Icon.Play}
          shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
        />
        <Action.OpenInBrowser
          title="Issues"
          url={`${base}/issues`}
          icon={Icon.ExclamationMark}
          shortcut={{ modifiers: ["cmd"], key: "i" }}
        />
        <Action.OpenInBrowser
          title="Branches"
          url={`${base}/branches`}
          icon={Icon.Tree}
          shortcut={{ modifiers: ["cmd"], key: "b" }}
        />
        <Action.OpenInBrowser
          title="Releases"
          url={`${base}/releases`}
          icon={Icon.Tag}
          shortcut={{ modifiers: ["cmd"], key: "l" }}
        />
        <Action.OpenInBrowser
          title="Settings"
          url={`${base}/settings`}
          icon={Icon.Gear}
          shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
        />
        <Action
          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          icon={isFav ? Icon.StarDisabled : Icon.Star}
          shortcut={{ modifiers: ["cmd"], key: "f" }}
          onAction={() => toggleFavorite(repo.full_name)}
        />
        <Action
          title="Refresh Repos"
          icon={Icon.ArrowClockwise}
          shortcut={{ modifiers: ["cmd"], key: "r" }}
          onAction={() => loadRepos(true)}
        />
      </ActionPanel>
    );
  }

  function repoItem(repo: Repo) {
    const isFav = favorites.has(repo.full_name);
    const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || Color.SecondaryText : undefined;
    return (
      <List.Item
        key={repo.full_name}
        icon={isFav ? { source: Icon.Star, tintColor: Color.Yellow } : repo.private ? Icon.Lock : Icon.Globe}
        title={repo.full_name}
        subtitle={repo.description || ""}
        accessories={[
          ...(repo.language ? [{ tag: { value: repo.language, color: langColor } }] : []),
          ...(repo.stargazers_count > 0 ? [{ text: `${repo.stargazers_count}`, icon: Icon.Star }] : []),
        ]}
        actions={repoActions(repo)}
      />
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search GitHub repos...">
      {favs.length > 0 && (
        <List.Section title="Favorites" subtitle={`${favs.length}`}>
          {favs.map(repoItem)}
        </List.Section>
      )}
      {owned.length > 0 && (
        <List.Section title="My Repos" subtitle={`${owned.length}`}>
          {owned.map(repoItem)}
        </List.Section>
      )}
      {contributed.length > 0 && (
        <List.Section title="Organizations & Contributed" subtitle={`${contributed.length}`}>
          {contributed.map(repoItem)}
        </List.Section>
      )}
    </List>
  );
}
