import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform, StyleSheet, View } from "react-native";
import { SelectedTabLabel } from "@/components/navigation/SelectedTabLabel";
import { TabBarAddButton } from "@/components/navigation/TabBarAddButton";
import { FontSizes, TabBarColors } from "@/constants/theme";

const tabLabelStyle = {
  default: {
    color: TabBarColors.labelInactive,
    fontSize: FontSizes.xs,
    fontWeight: "500" as const,
  },
  selected: {
    color: TabBarColors.labelActive,
    fontSize: FontSizes.xs,
    fontWeight: "600" as const,
  },
};

export default function TabsLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={styles.shell}>
        <NativeTabs
          tintColor={TabBarColors.active}
          iconColor={{
            default: TabBarColors.inactive,
            selected: TabBarColors.active,
          }}
          labelStyle={tabLabelStyle}
          backgroundColor={TabBarColors.background}
          blurEffect={
            Platform.OS === "ios" ? "systemThinMaterialLight" : undefined
          }
          shadowColor={TabBarColors.shadow}
          rippleColor={TabBarColors.ripple}
          indicatorColor={TabBarColors.indicator}
          minimizeBehavior="onScrollDown"
          labelVisibilityMode="selected"
        >
          <NativeTabs.Trigger name="index" disableTransparentOnScrollEdge>
            <NativeTabs.Trigger.Icon
              sf={{ default: "house", selected: "house.fill" }}
              md="home"
            />
            <SelectedTabLabel name="index">Home</SelectedTabLabel>
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="analytics" disableTransparentOnScrollEdge>
            <NativeTabs.Trigger.Icon
              sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
              md="bar_chart"
            />
            <SelectedTabLabel name="analytics">Analytics</SelectedTabLabel>
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="profile" disableTransparentOnScrollEdge>
            <NativeTabs.Trigger.Icon
              sf={{ default: "person", selected: "person.fill" }}
              md="person"
            />
            <SelectedTabLabel name="profile">Profile</SelectedTabLabel>
          </NativeTabs.Trigger>
        </NativeTabs>
        <TabBarAddButton />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
