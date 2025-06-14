export const loadLocalTimestamps = (): Record<string, string> => {
  const data = localStorage.getItem('trackTimestamps');
  return data ? JSON.parse(data) : {};
};

export const saveLocalTimestamps = (timestamps: Record<string, string>) => {
  localStorage.setItem('trackTimestamps', JSON.stringify(timestamps));
};