export const selectProductRowById = (listData: any[], id: string) => {
   return listData.filter((row) => row.id === id);
};
