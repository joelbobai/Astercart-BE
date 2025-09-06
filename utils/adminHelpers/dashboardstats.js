export const getGraphValuesPayments = (payments, key = "amount") => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayStamps = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    dayStamps.push(day);
  }

  return dayStamps.map((day) => {
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    return payments
      .filter((p) => new Date(p.createdAt) <= endOfDay)
      .reduce((sum, p) => sum + (p[key] || 0), 0);
  });
};

export const totalDashboardFunction = (payments, key = "amount") => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const previous = payments.filter(
    (p) => new Date(p.createdAt) <= sevenDaysAgo
  );

  const graphValues = getGraphValuesPayments(payments, key);

  const total = payments.reduce((sum, p) => sum + (p[key] || 0), 0);

  return {
    value: total,
    percentageDifference: previous.length
      ? Math.round(((payments.length - previous.length) / previous.length) * 100)
      : 0,
    graphValues,
  };
};