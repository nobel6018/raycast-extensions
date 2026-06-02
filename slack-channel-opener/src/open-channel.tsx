import {
  ActionPanel,
  Action,
  List,
  getPreferenceValues,
  showToast,
  Toast,
  Icon,
  Cache,
  open,
  Color,
} from "@raycast/api";
import { useEffect, useState, useMemo, useCallback } from "react";

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  topic?: { value: string };
  purpose?: { value: string };
  num_members?: number;
}

interface Preferences {
  slackToken: string;
}

interface CacheData {
  channels: SlackChannel[];
  teamId: string;
  timestamp: number;
}

const cache = new Cache();
const CACHE_KEY = "slack-channels";
const FAVORITES_KEY = "slack-favorites";
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function loadFavorites(): string[] {
  const raw = cache.get(FAVORITES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]) {
  cache.set(FAVORITES_KEY, JSON.stringify(favs));
}

async function fetchTeamId(token: string): Promise<string> {
  const res = await fetch("https://slack.com/api/auth.test", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as {
    ok: boolean;
    team_id: string;
    error?: string;
  };
  if (!data.ok) {
    throw new Error(`auth.test failed: ${data.error}`);
  }
  return data.team_id;
}

async function fetchAllChannels(token: string): Promise<SlackChannel[]> {
  const allChannels: SlackChannel[] = [];
  let cursor = "";

  do {
    const params = new URLSearchParams({
      types: "public_channel,private_channel",
      limit: "200",
      exclude_archived: "true",
    });
    if (cursor) {
      params.set("cursor", cursor);
    }

    const res = await fetch(
      `https://slack.com/api/conversations.list?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = (await res.json()) as {
      ok: boolean;
      channels: SlackChannel[];
      response_metadata?: { next_cursor?: string };
      error?: string;
    };

    if (!data.ok) {
      throw new Error(`conversations.list failed: ${data.error}`);
    }

    allChannels.push(...data.channels);
    cursor = data.response_metadata?.next_cursor || "";
  } while (cursor);

  return allChannels.sort((a, b) => a.name.localeCompare(b.name));
}

export default function Command() {
  const { slackToken } = getPreferenceValues<Preferences>();
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamId, setTeamId] = useState("");
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  async function loadChannels(skipCache = false) {
    setIsLoading(true);

    if (!skipCache) {
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        try {
          const data: CacheData = JSON.parse(cached);
          if (Date.now() - data.timestamp < CACHE_TTL) {
            setChannels(data.channels);
            setTeamId(data.teamId);
            setIsLoading(false);
            return;
          }
        } catch {
          // corrupted cache, ignore
        }
      }
    }

    try {
      const [tid, allChannels] = await Promise.all([
        fetchTeamId(slackToken),
        fetchAllChannels(slackToken),
      ]);

      setTeamId(tid);
      setChannels(allChannels);

      cache.set(
        CACHE_KEY,
        JSON.stringify({
          channels: allChannels,
          teamId: tid,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch channels",
        message: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadChannels();
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const moveFavorite = useCallback((id: string, direction: -1 | 1) => {
    setFavorites((prev) => {
      const idx = prev.indexOf(id);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      saveFavorites(next);
      return next;
    });
  }, []);

  const { favs, joined, other } = useMemo(() => {
    const channelMap = new Map(channels.map((ch) => [ch.id, ch]));
    const favSet = new Set(favorites);
    const favs: SlackChannel[] = favorites
      .map((id) => channelMap.get(id))
      .filter((ch): ch is SlackChannel => ch !== undefined);
    const joined: SlackChannel[] = [];
    const other: SlackChannel[] = [];
    for (const ch of channels) {
      if (favSet.has(ch.id)) {
        continue;
      } else if (ch.is_member) {
        joined.push(ch);
      } else {
        other.push(ch);
      }
    }
    return { favs, joined, other };
  }, [channels, favorites]);

  function channelItem(channel: SlackChannel) {
    const isFav = favorites.includes(channel.id);
    const favIndex = favorites.indexOf(channel.id);
    return (
      <List.Item
        key={channel.id}
        icon={
          isFav
            ? { source: Icon.Star, tintColor: Color.Yellow }
            : channel.is_private
              ? Icon.Lock
              : Icon.Hashtag
        }
        title={channel.name}
        subtitle={channel.purpose?.value || channel.topic?.value || ""}
        accessories={[
          ...(channel.num_members != null
            ? [{ text: `${channel.num_members}`, icon: Icon.Person }]
            : []),
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Open in Slack"
              icon={Icon.ArrowRight}
              onAction={() =>
                open(`slack://channel?team=${teamId}&id=${channel.id}`)
              }
            />
            <Action
              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
              icon={isFav ? Icon.StarDisabled : Icon.Star}
              shortcut={{ modifiers: ["cmd"], key: "f" }}
              onAction={() => toggleFavorite(channel.id)}
            />
            {isFav && favIndex > 0 && (
              <Action
                title="Move up in Favorites"
                icon={Icon.ArrowUp}
                shortcut={{ modifiers: ["cmd", "opt"], key: "arrowUp" }}
                onAction={() => moveFavorite(channel.id, -1)}
              />
            )}
            {isFav && favIndex >= 0 && favIndex < favorites.length - 1 && (
              <Action
                title="Move down in Favorites"
                icon={Icon.ArrowDown}
                shortcut={{ modifiers: ["cmd", "opt"], key: "arrowDown" }}
                onAction={() => moveFavorite(channel.id, 1)}
              />
            )}
            <Action
              title="Refresh Channels"
              icon={Icon.ArrowClockwise}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
              onAction={() => loadChannels(true)}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Slack channels...">
      {favs.length > 0 && (
        <List.Section title="Favorites" subtitle={`${favs.length}`}>
          {favs.map(channelItem)}
        </List.Section>
      )}
      <List.Section title="Joined" subtitle={`${joined.length}`}>
        {joined.map(channelItem)}
      </List.Section>
      <List.Section title="Other" subtitle={`${other.length}`}>
        {other.map(channelItem)}
      </List.Section>
    </List>
  );
}
