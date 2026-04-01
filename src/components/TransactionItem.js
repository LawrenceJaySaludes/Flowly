import { Pressable, Text, View } from "react-native";

const itemShadow = {
  shadowColor: "#111827",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 3,
};

function getTransactionPalette(type) {
  if (type === "income") {
    return {
      accent: "#166534",
      accentSoft: "#DCFCE7",
      amountColor: "#15803D",
      borderColor: "#BBF7D0",
      chipBackground: "#F0FDF4",
      chipText: "#166534",
      surfaceColor: "#FCFFFD",
    };
  }

  if (type === "initial_balance") {
    return {
      accent: "#0F766E",
      accentSoft: "#CCFBF1",
      amountColor: "#0F766E",
      borderColor: "#99F6E4",
      chipBackground: "#F0FDFA",
      chipText: "#115E59",
      surfaceColor: "#F8FFFE",
    };
  }

  return {
    accent: "#B91C1C",
    accentSoft: "#FFE4E6",
    amountColor: "#DC2626",
    borderColor: "#FECDD3",
    chipBackground: "#FFF1F2",
    chipText: "#B91C1C",
    surfaceColor: "#FFFDFD",
  };
}

export default function TransactionItem({
  transaction,
  formatCurrency,
  isDeleting = false,
  onDelete,
}) {
  const isIncome = transaction.type === "income";
  const isStartingBalance = transaction.type === "initial_balance";
  const displayDate = transaction.date?.split("T")[0] || transaction.date;
  const palette = getTransactionPalette(transaction.type);
  const displayNote = transaction.note?.trim();
  const categoryInitial =
    transaction.category?.trim()?.charAt(0)?.toUpperCase() || "T";

  return (
    <View
      className="overflow-hidden rounded-[26px] border px-4 py-4"
      style={{
        ...itemShadow,
        backgroundColor: palette.surfaceColor,
        borderColor: palette.borderColor,
      }}
    >
      <View
        className="absolute -right-4 top-0 h-20 w-20 rounded-full"
        style={{ backgroundColor: palette.accentSoft }}
      />
      <View
        className="absolute -left-4 bottom-0 h-14 w-14 rounded-full"
        style={{ backgroundColor: `${palette.accent}12` }}
      />

      <View
        className={`flex-row justify-between gap-4 ${
          displayNote ? "items-start" : "items-center"
        }`}
      >
        <View
          className={`flex-1 flex-row gap-3 ${
            displayNote ? "items-start" : "items-center"
          }`}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-[16px]"
            style={{ backgroundColor: palette.accentSoft }}
          >
            <Text
              className="text-base font-black"
              style={{ color: palette.accent }}
            >
              {categoryInitial}
            </Text>
          </View>

          <View className={`flex-1 ${displayNote ? "" : "justify-center"}`}>
            <Text className="text-base font-semibold text-ink">
              {transaction.category}
            </Text>
            {displayNote ? (
              <Text
                className="mt-1 text-sm leading-5 text-muted"
                numberOfLines={2}
              >
                {displayNote}
              </Text>
            ) : null}
          </View>
        </View>

        <View className={`items-end ${displayNote ? "" : "justify-center"}`}>
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: palette.chipBackground }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-[1.3px]"
              style={{ color: palette.chipText }}
            >
              {isStartingBalance ? "Start" : isIncome ? "Income" : "Expense"}
            </Text>
          </View>

          <Text
            className={`font-extrabold tracking-tight ${
              displayNote ? "mt-3 text-base" : "mt-2 text-[18px]"
            }`}
            style={{ color: palette.amountColor }}
          >
            {`${isIncome || isStartingBalance ? "+" : "-"} ${formatCurrency(transaction.amount)}`}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-3">
        <View
          className="rounded-full px-3 py-2"
          style={{ backgroundColor: "#FFFFFFCC" }}
        >
          <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
            {displayDate}
          </Text>
        </View>

        <View className="items-end gap-2">
          <Text className="text-xs font-medium text-slate-500">
            {isStartingBalance
              ? "Included in total balance"
              : isIncome
                ? "Boosted your balance"
                : "Reduced your balance"}
          </Text>

          {onDelete ? (
            <Pressable
              className="rounded-full border border-red-200 bg-red-50 px-3 py-2 active:opacity-90"
              disabled={isDeleting}
              onPress={onDelete}
            >
              <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-danger">
                {isDeleting ? "Deleting" : "Delete"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
