/**
 * Calculates the number of working days between two dates (inclusive)
 * by excluding weekends (Saturdays and Sundays).
 */
const getWorkingDaysCount = (startDate, endDate) => {
  let count = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count > 0 ? count : 1; // Return at least 1 if dates are same or weirdly structured
};

module.exports = {
  getWorkingDaysCount,
};
