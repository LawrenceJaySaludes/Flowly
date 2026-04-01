import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithGoogle } from "../utils/auth";

const FLOWLY_LOGO = require("../../assets/flowly.png");
const GOOGLE_ICON = require("../../assets/google-icon.png");

const cardShadow = {
  shadowColor: "#111827",
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.08,
  shadowRadius: 30,
  elevation: 4,
};

const panelShadow = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.07,
  shadowRadius: 24,
  elevation: 4,
};

export default function LoginScreen() {
  const isWeb = Platform.OS === "web";
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setIsSigningIn(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
      setErrorMessage(error.message || "Unable to continue with Google.");
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isWeb ? "#F7F9FC" : "#FFFFFF" }}
      className={isWeb ? "items-center justify-center px-4 py-6" : ""}
    >
      <View
        className={`w-full flex-1 bg-canvas ${isWeb ? "max-w-[420px] rounded-[32px]" : ""}`}
        style={isWeb ? cardShadow : undefined}
      >
        <View className="flex-1 justify-center overflow-hidden px-5 pb-8 pt-6">
          <View className="absolute -left-10 top-24 h-40 w-40 rounded-full bg-emerald-100/80" />
          <View className="absolute -right-12 bottom-20 h-48 w-48 rounded-full bg-sky-100/80" />
          <View className="absolute right-10 top-20 h-24 w-24 rounded-full bg-amber-100/60" />

          <View className="items-center px-4">
            <View
              className="h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border border-white/80 bg-white p-3"
              style={panelShadow}
            >
              <Image
                source={FLOWLY_LOGO}
                resizeMode="contain"
                style={{ height: 72, width: 72 }}
              />
            </View>

            <Text className="mt-5 text-[38px] font-black tracking-[-1px] text-ink">
              Flowly
            </Text>
            <Text className="mt-3 max-w-[280px] text-center text-base leading-7 text-muted">
              Track your balance, income, and spending in one calm place.
            </Text>
          </View>

          <View
            className="mt-10 overflow-hidden rounded-[30px] border border-slate-100 bg-surface px-5 py-6"
            style={panelShadow}
          >
            <View className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-emerald-100/80" />
            <View className="absolute -left-5 bottom-0 h-16 w-16 rounded-full bg-sky-100/70" />

            <Text className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">
              Sign In
            </Text>
            <Text className="mt-2 text-[24px] font-bold tracking-tight text-ink">
              Continue with Google
            </Text>
            <Text className="mt-2 text-sm leading-6 text-muted">
              Use your Google account to open Flowly.
            </Text>

            <Pressable
              className="mt-6 rounded-[24px] border border-slate-200 bg-white px-4 py-4 active:opacity-90"
              disabled={isSigningIn}
              onPress={handleGoogleSignIn}
            >
              <View className="relative min-h-[48px] items-center justify-center">
                <View className="absolute left-0 h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <Image
                    source={GOOGLE_ICON}
                    resizeMode="contain"
                    style={{ height: 22, width: 22 }}
                  />
                </View>

                <Text className="text-base font-semibold text-ink">
                  {isSigningIn
                    ? "Signing in with Google..."
                    : "Sign in with Google"}
                </Text>

                {isSigningIn ? (
                  <View className="absolute right-0 h-12 w-12 items-center justify-center">
                    <ActivityIndicator color="#22C55E" size="small" />
                  </View>
                ) : null}
              </View>
            </Pressable>

            {errorMessage ? (
              <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <Text className="text-sm font-medium text-danger">
                  {errorMessage}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
