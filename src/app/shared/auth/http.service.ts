import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  apiUrl: any;
  headers = {
    'Content-Type': 'application/json'
  };
  constructor(private http: HttpClient, @Inject('Environment') env: any) {
    this.apiUrl = env.apiUrl;
  }

  getMethod(url: string) {
    return this.http.get(this.apiUrl + url, { headers: this.headers });
  }

  postMethod(url: string, body: any) {
    return this.http.post(this.apiUrl + url, body, { headers: this.headers });
  }

  formDataRequest(url: string, formData: any) {
    return this.http.post(this.apiUrl + url, formData);
  }

  putMethod(url: string, body: any) {
    return this.http.put(this.apiUrl + url, body, { headers: this.headers });
  }
  deleteMethod(url: string) {
    return this.http.delete(this.apiUrl + url, { headers: this.headers });
  }
  // downloadArrayBuffer(url: string, body: any) {
  //   return this.http.post(this.apiUrl + url, body, {
  //     responseType: 'arraybuffer',
  //     headers: {
  //       'Content-Type': undefined
  //     }
  //   });
  // }
}
