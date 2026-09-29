export async function compressImageDataUrl(file: File, maxDimension = 1200, maxChars = 42000): Promise<string> {
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('อ่านรูปภาพไม่สำเร็จ'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('เปิดรูปภาพไม่สำเร็จ'));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('ไม่สามารถประมวลผลรูปภาพได้');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  let quality = 0.72;
  let result = canvas.toDataURL('image/webp', quality);
  while (result.length > maxChars && quality > 0.28) {
    quality -= 0.08;
    result = canvas.toDataURL('image/webp', quality);
  }

  if (result.length > maxChars) {
    const smaller = Math.max(320, Math.round(maxDimension * 0.7));
    return compressImageDataUrl(file, smaller, maxChars);
  }
  return result;
}
