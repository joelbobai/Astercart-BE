export const totalStoresFunction = (stores) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
    const prevStores = stores.filter(store => new Date(store.createdAt) <= sevenDaysAgo).length;
    const result = getStoreGraphValues(stores, true);
  
    return {
      value: stores.length,
      percentageDifference: prevStores ? Math.round(((stores.length - prevStores) / prevStores) * 100) : 0,
      graphValues: result
    };
  };
  
  export const getStoreGraphValues = (stores, all = true) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayStamps = [];
  
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      dayStamps.push(day);
    }
  
    const result = dayStamps.map(day => {
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);
  
      const count = all
        ? stores.filter(store => new Date(store.createdAt) <= endOfDay).length
        : stores.filter(store => new Date(store.createdAt).toISOString().split("T")[0] === endOfDay.toISOString().split("T")[0]).length;
  
      return count;
    });
  
    return result;
  };
  