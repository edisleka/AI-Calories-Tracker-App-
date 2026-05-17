import { HugeiconsIcon } from "@hugeicons/react-native";
import type { ComponentProps } from "react";

type Icon = ComponentProps<typeof HugeiconsIcon>["icon"];

type Props = {
  icon: Icon;
  size?: number;
  color: string;
};

export function HugeIcon({ icon, size = 24, color }: Props) {
  return (
    <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={1.8} />
  );
}
