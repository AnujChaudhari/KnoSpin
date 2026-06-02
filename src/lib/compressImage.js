export const compressImage = (file, maxWidth = 1024, maxSizeKB = 500) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.8;
        const compress = () => {
          canvas.toBlob(async (blob) => {
            if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
              resolve(compressedFile);
            } else {
              quality -= 0.1;
              canvas.toBlob(compress, 'image/jpeg', quality);
            }
          }, 'image/jpeg', quality);
        };
        compress();
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
