import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Shadows, Spacing } from "@/constants/theme";

/** Approximate native tab bar content height (excluding home indicator). */
const TAB_BAR_HEIGHT = 49;
/** Space between the FAB and the top of the tab bar. */
const GAP_ABOVE_TAB_BAR = Spacing.huge;

/** Floating "+" above the native tab bar (does not add a 4th tab). */
export function TabBarAddButton() {
  const insets = useSafeAreaInsets();
  const bottomOffset =
    insets.bottom + TAB_BAR_HEIGHT + GAP_ABOVE_TAB_BAR;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { paddingBottom: bottomOffset }]}
    >
      <Pressable
        style={styles.fab}
        onPress={() =>
          Alert.alert(
            "Coming soon",
            "Meal logging and food scanning will be available here.",
          )
        }
        accessibilityRole="button"
        accessibilityLabel="Add entry"
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 20,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primary,
  },
});
