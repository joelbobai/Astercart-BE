export const totalUsersFunction=(users)=>{
  
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate()-7)
    const prevUsers= users.filter(user=> new Date(user.createdAt)<=sevenDaysAgo).length
    const result = getGraphValues(users, true)
        
      
        return {
            value:users.length,
            percentageDifference:prevUsers?Math.round(((users.length - prevUsers) / prevUsers) * 100):0,
            graphValues:result
            // graphValues:[2,5,9,13,9]
          }
}

export const getGraphValues = (users, all=true)=>{
  const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize time
        const dayStamps = [];
      
        // Prepare dates for 6 days ago → today
        for (let i = 6; i >= 0; i--) {
          const day = new Date(today);
          day.setDate(today.getDate() - i);
          dayStamps.push(day);
        }
      
        // For each date, count all users created at or before that day (end of day)
        const result = dayStamps.map(day => {
          const endOfDay = new Date(day);
          endOfDay.setHours(23, 59, 59, 999);
      
          const count = all?users.filter(user => new Date(user.createdAt) <= endOfDay).length:users.filter(user => new Date(user.createdAt) == endOfDay).length ;
          return count;
        });

        return result
}