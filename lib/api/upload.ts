import { current } from "@reduxjs/toolkit";
import { authFetch } from "./auth";

const CHUNK_SIZE = 5 * 1024 * 1024;

export async function smartUpload(file: File, onProgress?: (
  pct:number,
  partInfo?: {currentPart: Number, totalParts: Number}
) => void) {
  if(file.size <= CHUNK_SIZE) {
    const result = await singleUpload(file, onProgress)
    if (result.status === 'error') {
      throw new Error(result.message)
    }
    return result
  }
  // khoi tao upload nhân upload_id, key, asset_id
  const res = await authFetch('/api/storage/multipart/create/', {
    method: "POST",
    body: JSON.stringify({content_type: file.type, filename: file.name})
  })
  if(!res.ok){
    const errorData = await res.json()
    throw new Error(errorData.detail || "Loại file không được chấp nhận")
  }
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
    if(!presignRes.ok){
      const errorData = await presignRes.json()
      throw new Error(errorData.detail || "Lỗi khi lấy presigned URL")
    }
    const { url } = await presignRes.json();

    // Lấy url này đay lên MinIO
    const etag = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      // tinh progress dựa trên mảnh hiện tại
      xhr.upload.onprogress = (e) => {
        if(onProgress){
          const totalLoad = i * CHUNK_SIZE + e.loaded;
          const totalPct = Math.min(99, Math.round((totalLoad / file.size) * 100))
          onProgress(totalPct, {currentPart: partNumber, totalParts: totalChunk});
        }
      };

      xhr.onload = () => {
        resolve(xhr.getResponseHeader('ETag')?.replace(/"/g, "") || "")
      }
      xhr.onerror = () => reject(new Error(`Lỗi upload part ${partNumber}`))

      xhr.send(chunk);
    });
    partETags.push({part_number: partNumber,etag})
    onProgress?.(
        Math.min(99, Math.round(((i + 1) * CHUNK_SIZE / file.size) * 100)), 
        { currentPart: partNumber, totalParts: totalChunk }
    );
  }

  // gui url hoan thanh
  const completeRes = await authFetch('/api/storage/multipart/complete/', {
    method: 'POST',
    body: JSON.stringify({ asset_id, key, upload_id, parts: partETags})
  })
  if (!completeRes.ok) {
    const errorData = await completeRes.json()
    throw new Error(errorData.detail || "Lỗi khi hoàn thành upload")
  }
  onProgress?.(100)
  return { key, assetId: asset_id}
}

async function singleUpload(file: File, onProgress: any) {
  const res = await authFetch('/api/storage/presign-put/', {
    method: "POST",
    headers: { 'Content-Type' : 'application/json'},
    body: JSON.stringify({content_type: file.type, filename: file.name})
  })
  if(!res.ok){
    const errorData = await res.json()
    return {
      status: "error",
      message: errorData.detail || "Loại file không được chấp nhận"
    }
  }
  const { id, put_url, key } = await res.json();
  await new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', put_url);
    xhr.setRequestHeader('Content-Type', file.type);
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