import React from "react";
import { IllustrationType, IllustrationProps } from "./types";
import { AuthWelcome } from "./components/AuthWelcome";
import { EmptyQuiet } from "./components/EmptyQuiet";
import { WaitingSoft } from "./components/WaitingSoft";
import { ConnectionCards } from "./components/ConnectionCards";

export const registry: Record<IllustrationType, React.FC<IllustrationProps>> = {
  "auth-welcome": AuthWelcome,
  "empty-quiet": EmptyQuiet,
  "waiting-soft": WaitingSoft,
  "connection-cards": ConnectionCards,
};
