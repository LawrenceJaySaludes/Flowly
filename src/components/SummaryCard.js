import { Text, View } from "react-native";

const cardShadow = {
  shadowColor: "#111827",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
  elevation: 3,
};

export default function SummaryCard({ title, amount, tone = "default" }) {
  const amountColorClass =
    tone === "income" ? "text-brand" : tone === "expense" ? "text-danger" : "text-ink";

  return (
    <View className="rounded-2xl border border-slate-100 bg-canvas p-5" style={cardShadow}>
      <Text className="text-sm font-medium text-muted">{title}</Text>
      <Text className={`mt-3 text-[28px] font-bold tracking-tight ${amountColorClass}`}>
        {amount}
      </Text>
    </View>
  );
}

