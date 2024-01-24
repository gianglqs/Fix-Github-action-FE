export const selectDataRowById = (listData: any[], fieldIdName: string, id: string) => {
   return listData.filter((row) => row[fieldIdName] === id);
};
