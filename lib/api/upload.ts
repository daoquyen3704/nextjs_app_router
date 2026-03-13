import { authFetch } from "./auth";

const CHUNK_SIZE = 5 * 1024 * 1024;

export async function smartUpload(file: File, onProgress?: (pct:number) => void) {
  if(file.size <= CHUNK_SIZE) {
    return await singleUpload(file, onProgress)
  }
  // khoi tao upload nhân upload_id, key, asset_id
  const res = await authFetch('/api/storage/multipart/create/', {
    method: "POST",
    body: JSON.stringify({content_type: file.type, filename: file.name})
  })
  const { upload_id, key, asset_id} = await res.json();
  const totalChunk =  Math.ceil(file.size / CHUNK_SIZE);
  const partETags = [];
  
  //lap qua tung part, nhân Etag trả về
  for(let i = 0; i < totalChunk; i++){
    const partNumber = i+1;
    const start = i * CHUNK_SIZE;
    const chunk = file.slice(start, start + CHUNK_SIZE)
    console.log("key: ", key,"partNumber: ", partNumber, " uploadID: ", upload_id);
    // lấy presign_url cho part nay luon
    const presignRes = await authFetch('/api/storage/multipart/presign-part/',{
      method: "POST",
      body: JSON.stringify({key, upload_id, part_number: partNumber })
    })
    const { url } = await presignRes.json();

    // Lấy url này đay lên MinIO
    const etag = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.onload = () => resolve(xhr.getResponseHeader('ETag') || "")
      xhr.onerror = () => reject(new Error("Lỗi upload ảnh"))

      // tinh progress dựa trên mảnh hiện tại
      xhr.upload.onprogress = (e) => {
        if(onProgress){
          const totalLoad = i * CHUNK_SIZE + e.loaded;
          onProgress(Math.min(99, Math.round((totalLoad / file.size) * 100)));
        }
      };
      xhr.send(chunk);
    });
    partETags.push({part_number: partNumber,etag})
  }

  // gui url hoan thanh
  await authFetch('/api/storage/multipart/complete/', {
    method: 'POST',
    body: JSON.stringify({ asset_id, key, upload_id, parts: partETags})
  })
  onProgress?.(100)
  return { key, assetId: asset_id}
}

async function singleUpload(file: File, onProgress: any) {
  const res = await authFetch('/api/storage/presign-put/', {
    method: "POST",
    body: JSON.stringify({content_type: file.type, filename: file.name})
  })
  const { id, put_url, key } = await res.json();
  
  await new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', put_url);
    xhr.setRequestHeader('Content_type', file.type);
    xhr.upload.onprogress = (e) => onProgress?.(Math.round((e.loaded/e.total) * 100));
    xhr.onload = resolve;
    xhr.send(file);
  })
  await authFetch('/api/storage/confirm', {
    method: "POST",
    body: JSON.stringify({ id })
  })
  return  {key, assetId: id}
}