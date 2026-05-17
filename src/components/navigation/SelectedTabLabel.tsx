import { NativeTabs } from "expo-router/unstable-native-tabs";
import { usePathname } from "expo-router";
import { Platform } from "react-native";
import { FontSizes, TabBarColors } from "@/constants/theme";

type TabRouteName = "index" | "analytics" | "profile";

function getActiveTab(pathname: string): TabRouteName {
  if (pathname.includes("/analytics")) return "analytics";
  if (pathname.includes("/profile")) return "profile";
  return "index";
}

type Props = {
  name: TabRouteName;
  children: string;
};

/**
 * Shows the tab label only for the active route on iOS (no native API).
 * On Android, NativeTabs `labelVisibilityMode="selected"` handles this.
 */
export function SelectedTabLabel({ name, children }: Props) {
  const pathname = usePathname();
  const isActive = getActiveTab(pathname) === name;
  const hidden = Platform.OS === "ios" && !isActive;

  return (
    <NativeTabs.Trigger.Label
      hidden={hidden}
      selectedStyle={{
        color: TabBarColors.labelActive,
        fontSize: FontSizes.xs,
        fontWeight: "600",
      }}
    >
      {children}
    </NativeTabs.Trigger.Label>
  );
}
