import { BASE_URL } from '@/Path/backend';

export const handleDownloadFile = (fileName: string, path: string) => {
   const fileURL = BASE_URL + path;

   fetch(fileURL, { method: 'GET' })
      .then((response) => response.blob())
      .then((blob) => {
         // Create blob link to download
         const url = window.URL.createObjectURL(new Blob([blob]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', fileName);

         // Append to html link element page
         document.body.appendChild(link);

         // Start download
         link.click();

         // Clean up and remove the link
         link.parentNode.removeChild(link);
      })
      .catch((e) => {
         console.log(e);
      });
};

export const getFileNameFromPath = (path: string) => {
   return path.split('\\').pop().split('/').pop();
};
