import { useQuery } from "@tanstack/react-query";

interface PageAsset {
  slotKey: string;
  displayOrder: number;
  isActive: boolean;
  media: {
    id: string;
    url: string;
    altText: string | null;
    caption: string | null;
  } | null;
}

export function usePageAssets(pageSlug: string) {
  const { data, isLoading, error } = useQuery<PageAsset[]>({
    queryKey: ["/api/page-assets", pageSlug],
  });

  const getImage = (slotKey: string): PageAsset["media"] | null => {
    const asset = data?.find(a => a.slotKey === slotKey && a.isActive);
    return asset?.media || null;
  };

  const getImages = (prefix: string): PageAsset["media"][] => {
    return (data || [])
      .filter(a => a.slotKey.startsWith(prefix) && a.isActive && a.media)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(a => a.media!);
  };

  return {
    assets: data || [],
    isLoading,
    error,
    getImage,
    getImages,
  };
}

export function useWebsiteContent(pageSlug: string) {
  const { data, isLoading, error } = useQuery<Record<string, string>>({
    queryKey: ["/api/content", pageSlug],
  });

  const getContent = (sectionKey: string, fallback: string = ""): string => {
    return data?.[sectionKey] || fallback;
  };

  return {
    content: data || {},
    isLoading,
    error,
    getContent,
  };
}
