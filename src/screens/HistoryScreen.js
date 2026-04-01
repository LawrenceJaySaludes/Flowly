import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionItem from "../components/TransactionItem";
import {
  formatCurrency,
  getFriendlySupabaseError,
} from "../utils/transactions";

export default function HistoryScreen({
  errorMessage,
  isLoading,
  onBack,
  onDeleteTransaction,
  transactions,
}) {
  const isWeb = Platform.OS === "web";
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);

  async function handleDeleteTransaction(transaction) {
    if (!onDeleteTransaction || deletingTransactionId) {
      return;
    }

    setDeletingTransactionId(transaction.id);
    const { error } = await onDeleteTransaction(transaction.id);

    if (error) {
      Alert.alert("Unable to delete", getFriendlySupabaseError(error));
    }

    setDeletingTransactionId(null);
  }

  function handleDeletePress(transaction) {
    if (isWeb && typeof globalThis.confirm === "function") {
      const shouldDelete = globalThis.confirm(
        "Delete this transaction and update your totals?",
      );

      if (shouldDelete) {
        handleDeleteTransaction(transaction);
      }

      return;
    }

    Alert.alert(
      "Delete transaction",
      "This will remove the entry and update your totals right away.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            handleDeleteTransaction(transaction);
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
        <FlatList
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 28,
          }}
          data={transactions}
          ItemSeparatorComponent={() => <View className="h-3" />}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <View className="items-center rounded-2xl border border-slate-100 bg-surface px-5 py-10">
              {isLoading ? (
                <>
                  <ActivityIndicator color="#22C55E" size="large" />
                  <Text className="mt-4 text-sm font-medium text-muted">
                    Loading transactions...
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-base font-semibold text-ink">
                    No transactions yet
                  </Text>
                  <Text className="mt-2 text-center text-sm leading-6 text-muted">
                    Your full transaction history will appear here once you add
                    entries.
                  </Text>
                </>
              )}
            </View>
          }
          ListHeaderComponent={
            <View>
              <View className="flex-row items-center justify-between">
                <Pressable
                  className="rounded-full border border-slate-200 px-4 py-2 active:opacity-80"
                  onPress={onBack}
                >
                  <Text className="text-sm font-semibold text-ink">Back</Text>
                </Pressable>

                <Text className="text-sm font-semibold uppercase tracking-[1.4px] text-muted">
                  History
                </Text>

                <View className="w-[62px]" />
              </View>

              <View className="mb-4 mt-6">
                <Text className="text-[32px] font-extrabold tracking-tight text-ink">
                  All Transactions
                </Text>
                <Text className="mt-2 text-base leading-6 text-muted">
                  {transactions.length} total{" "}
                  {transactions.length === 1 ? "entry" : "entries"}
                </Text>
              </View>

              {errorMessage ? (
                <View className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <Text className="text-sm font-medium text-danger">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              formatCurrency={formatCurrency}
              isDeleting={deletingTransactionId === item.id}
              onDelete={() => handleDeletePress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
