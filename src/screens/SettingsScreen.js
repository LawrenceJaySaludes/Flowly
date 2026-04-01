import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase";

const cardShadow = {
  shadowColor: "#111827",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.06,
  shadowRadius: 24,
  elevation: 4,
};

export default function SettingsScreen({
  currentUserEmail,
  onBack,
  onResetAccount,
}) {
  const isWeb = Platform.OS === "web";
  const [isResettingAccount, setIsResettingAccount] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      Alert.alert(
        "Unable to log out",
        "We couldn't sign you out right now. Please try again.",
      );
      setIsSigningOut(false);
    }
  }

  async function handleResetAccount() {
    if (!onResetAccount || isResettingAccount) {
      return;
    }

    setIsResettingAccount(true);
    const { error } = await onResetAccount();

    if (error) {
      console.error("Reset account error:", error);
      Alert.alert(
        "Unable to reset",
        "We couldn't clear your transactions right now. Please try again.",
      );
      setIsResettingAccount(false);
      return;
    }

    setIsResettingAccount(false);
    Alert.alert(
      "Account reset",
      "All of your transactions were removed. Your totals are back to zero.",
      [
        {
          text: "OK",
          onPress: onBack,
        },
      ],
    );
  }

  function handleResetPress() {
    if (!onResetAccount || isResettingAccount) {
      return;
    }

    if (isWeb && typeof globalThis.confirm === "function") {
      const shouldReset = globalThis.confirm(
        "Reset your account and remove all transactions? This cannot be undone.",
      );

      if (shouldReset) {
        handleResetAccount();
      }

      return;
    }

    Alert.alert(
      "Reset account",
      "This will permanently remove all of your transactions and set your dashboard totals back to zero.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            handleResetAccount();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isWeb ? "#F7F9FC" : "#FFFFFF" }}
      className={isWeb ? "items-center justify-center px-4 py-6" : ""}
    >
      <View
        className={`w-full flex-1 bg-canvas ${isWeb ? "max-w-[420px] rounded-[32px]" : ""}`}
        style={
          isWeb
            ? {
                shadowColor: "#111827",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.08,
                shadowRadius: 30,
              }
            : undefined
        }
      >
        <View className="flex-1 px-5 pb-8 pt-6">
          <View className="flex-row items-center justify-between">
            <Pressable
              className="rounded-full border border-slate-200 px-4 py-2 active:opacity-80"
              onPress={onBack}
            >
              <Text className="text-sm font-semibold text-ink">Back</Text>
            </Pressable>

            <Text className="text-sm font-semibold uppercase tracking-[1.4px] text-muted">
              Settings
            </Text>

            <View className="w-[62px]" />
          </View>

          <View className="mt-6 overflow-hidden rounded-[30px] bg-slate-950 px-5 pb-6 pt-5">
            <View className="absolute -right-5 top-0 h-28 w-28 rounded-full bg-emerald-400/18" />
            <View className="absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-sky-300/12" />
            <View className="absolute right-10 top-14 h-8 w-8 rounded-full bg-white/8" />

            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-slate-300">
              Account
            </Text>
            <Text className="mt-3 text-[28px] font-extrabold tracking-tight text-white">
              Settings
            </Text>
            <Text className="mt-2 max-w-[260px] text-sm leading-6 text-slate-300">
              Manage your signed-in account and session in one place.
            </Text>
          </View>

          <View
            className="mt-5 rounded-[30px] border border-slate-100 bg-surface px-5 py-5"
            style={cardShadow}
          >
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
              Signed In As
            </Text>
            <Text className="mt-2 text-lg font-bold tracking-tight text-ink">
              {currentUserEmail || "Google account"}
            </Text>
            <Text className="mt-2 text-sm leading-6 text-muted">
              Log out here when you want to return to the login screen.
            </Text>

            <Pressable
              className="mt-5 rounded-[24px] bg-danger px-5 py-4 active:opacity-90"
              disabled={isSigningOut}
              onPress={handleSignOut}
            >
              <Text className="text-center text-base font-semibold text-white">
                {isSigningOut ? "Logging Out..." : "Log Out"}
              </Text>
            </Pressable>
          </View>

          <View
            className="mt-5 rounded-[30px] border border-red-100 bg-red-50 px-5 py-5"
            style={cardShadow}
          >
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-danger">
              Reset Account
            </Text>
            <Text className="mt-2 text-lg font-bold tracking-tight text-ink">
              Start over from zero
            </Text>
            <Text className="mt-2 text-sm leading-6 text-muted">
              Clear all saved transactions and return your dashboard totals to
              zero. We'll ask you to confirm before anything is removed.
            </Text>

            <Pressable
              className="mt-5 rounded-[24px] border border-red-200 bg-white px-5 py-4 active:opacity-90"
              disabled={isResettingAccount}
              onPress={handleResetPress}
            >
              <Text className="text-center text-base font-semibold text-danger">
                {isResettingAccount ? "Resetting Account..." : "Reset Account"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
