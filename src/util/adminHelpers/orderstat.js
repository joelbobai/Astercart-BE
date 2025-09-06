export const totalOrdersFunction = (orders) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
    const previousOrders = orders.filter(
      (order) => new Date(order.createdAt) <= sevenDaysAgo
    );
  
    const result = getGraphValuesOrders(orders);
  
    return {
      value: orders.length,
      percentageDifference: previousOrders.length
        ? Math.round(((orders.length - previousOrders.length) / previousOrders.length) * 100)
        : 0,
      graphValues: result,
    };
  };
  
  export const getGraphValuesOrders = (orders) => {
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
  
      const count = orders.filter((order) => new Date(order.createdAt) <= endOfDay).length;
      return count;
    });
  
    return result;
  };
  