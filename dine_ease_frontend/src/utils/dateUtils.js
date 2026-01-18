/**
 * @returns {{start: Date, end: Date}} Object with start and end of today.
 */
export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * @returns {{start: Date, end: Date}} Object with start (Sunday) and end (Saturday) of the current week.
 */
export const getThisWeekRange = () => {
  const today = new Date();
  const start = new Date(today);
  // setDate to Sunday of the current week
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  // setDate to Saturday of the current week
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * @returns {{start: Date, end: Date}} Object with start and end of the current month.
 */
export const getThisMonthRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * @returns {{start: Date, end: Date}} Object with start and end of the current year.
 */
export const getThisYearRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today.getFullYear(), 11, 31);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * @param {Date|string} startDate The start of the custom range.
 * @param {Date|string} endDate The end of the custom range.
 * @returns {{start: Date, end: Date}} Object with start and end of the custom range.
 */
/**
 * @param {Date|string} startDate The start of the custom range.
 * @param {Date|string} endDate The end of the custom range.
 * @returns {{start: Date, end: Date}} Object with start and end of the custom range.
 */
export const getCustomRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { start: null, end: null };
  }
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};