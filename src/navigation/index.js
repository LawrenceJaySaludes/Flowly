import { ActivityIndicator, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import useAuthSession from "../hooks/useAuthSession";
import useTransactions from "../hooks/useTransactions";
import DashboardScreen from "../screens/DashboardScreen";
import HistoryScreen from "../screens/HistoryScreen";
import LoginScreen from "../screens/LoginScreen";
import SettingsScreen from "../screens/SettingsScreen";

function AuthLoadingScreen() {
  const isWeb = Platform.OS === "web";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isWeb ? "#F7F9FC" : "#FFFFFF" }}
      className={isWeb ? "items-center justify-center px-4 py-6" : ""}
    >
      <View
        className={`w-full flex-1 items-center justify-center bg-canvas ${isWeb ? "max-w-[420px] rounded-[32px]" : ""}`}
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
        <View className="items-center rounded-[28px] border border-slate-100 bg-surface px-8 py-10">
          <ActivityIndicator color="#22C55E" size="large" />
          <Text className="mt-4 text-lg font-bold text-ink">
            Checking session
          </Text>
          <Text className="mt-2 text-center text-sm leading-6 text-muted">
            Preparing your Flowly dashboard and restoring your secure login.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const { session, isLoading: isAuthLoading } = useAuthSession();
  const {
    deleteTransaction,
    errorMessage,
    isLoading,
    refreshTransactions,
    resetTransactions,
    transactions,
  } = useTransactions(session?.user?.id);

  useEffect(() => {
    if (!session) {
      setCurrentScreen("dashboard");
    }
  }, [session]);

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (currentScreen === "history") {
    return (
      <HistoryScreen
        errorMessage={errorMessage}
        isLoading={isLoading}
        onBack={() => setCurrentScreen("dashboard")}
        onDeleteTransaction={deleteTransaction}
        transactions={transactions}
      />
    );
  }

  if (currentScreen === "settings") {
    return (
      <SettingsScreen
        currentUserEmail={session.user.email}
        onBack={() => setCurrentScreen("dashboard")}
        onResetAccount={resetTransactions}
      />
    );
  }

  return (
    <DashboardScreen
      currentUserId={session.user.id}
      errorMessage={errorMessage}
      isLoading={isLoading}
      onOpenHistory={() => setCurrentScreen("history")}
      onOpenSettings={() => setCurrentScreen("settings")}
      refreshTransactions={refreshTransactions}
      transactions={transactions}
    />
  );
}
