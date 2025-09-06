export const totalPaymentFunction = (payments, key = "amount") => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const previousPayments = payments.filter(
    (payment) => new Date(payment.createdAt) <= sevenDaysAgo
  );

  const result = getGraphValuesPayment(payments, key);

  return {
    value: payments.reduce((sum, payment) => sum + (payment[key] || 0), 0),
    percentageDifference: previousPayments.length
      ? Math.round(
          ((payments.length - previousPayments.length) / previousPayments.length) * 100
        )
      : 0,
    graphValues: result,
  };
};

export const getGraphValuesPayment = (payments, key = "amount") => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayStamps = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    dayStamps.push(day);
  }

  const result = dayStamps.map((day) => {
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const totalForDay = payments
      .filter(payment => new Date(payment.createdAt) <= endOfDay)
      .reduce((sum, p) => sum + (p[key] || 0), 0);

    return totalForDay;
  });

  return result;
};
