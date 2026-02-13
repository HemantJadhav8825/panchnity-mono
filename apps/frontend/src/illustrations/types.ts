export type IllustrationType =
  | "auth-welcome"
  | "empty-quiet"
  | "waiting-soft"
  | "connection-cards";

export interface IllustrationProps {
  className?: string;
  size?: number | string;
  priority?: boolean;
}
