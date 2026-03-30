import { Text, View } from "react-native";

const itemShadow = {
  shadowColor: "#111827",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 16,
  elevation: 2,
};

export default function TransactionItem({ transaction, formatCurrency }) {
  const isIncome = transaction.type === "income";
  const displayDate = transaction.date?.split("T")[0] || transaction.date;

  return (
    <View className="rounded-2xl border border-slate-100 bg-canvas p-4" style={itemShadow}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-base font-semibold text-ink">{transaction.category}</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">{transaction.note}</Text>
        </View>

        <Text className={`text-base font-bold ${isIncome ? "text-brand" : "text-danger"}`}>
          {`${isIncome ? "+" : "-"} ${formatCurrency(transaction.amount)}`}
        </Text>
      </View>

      <Text className="mt-3 text-xs font-medium uppercase tracking-[1.4px] text-muted">
        {displayDate}
      </Text>
    </View>
  );
}
