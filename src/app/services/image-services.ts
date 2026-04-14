import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageServices {
  private url = 'http://localhost:9090/rest/immagini';

  constructor(private http: HttpClient) {}

  upload(file: File, isbn?: string, id?: number): Observable<Response> {
    const formData = new FormData();
    formData.append('file', file);
    if (isbn) {
      formData.append('isbn', isbn);
    }
    if (id){
      formData.append('id', id.toString());
    }   
    console.log("will call image upload with parameters: ", formData);

    return this.http.post<Response>(`${this.url}/upload`, formData);
  }

  uploadDefault(file: File): Observable<Response> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Response>(`${this.url}/upload_default_img`, formData);
  }

  deleteImage(filename: string) {
    return this.http.delete(`${this.url}/delete`, { params: { filename: filename.toString() } });
  }

}
