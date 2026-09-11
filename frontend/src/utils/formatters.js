export const formatCurrency = (
  value,
  maximumFractionDigits = 2
) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits,
    }).format(0);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(numericValue);
};

export const formatPercentage = (
  value,
  maximumFractionDigits = 2
) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00%";
  }

  return `${numericValue.toFixed(
    maximumFractionDigits
  )}%`;
};