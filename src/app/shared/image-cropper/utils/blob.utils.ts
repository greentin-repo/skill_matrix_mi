// export function base64ToFile(base64Image: string): Blob {
//     const split = base64Image.split(',');
//     const type = split[0].replace('data:', '').replace(';base64', '');
//     const byteString = atob(split[1]);
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i += 1) {
//         ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type });
// }
export async function base64ToFile(dataUrl: string){
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    const ext = dataUrl.split(';')[0].split('/')[1];
    var fileName = 'profile.' + ext;
    return new File([blob], fileName, { type: blob.type });
}