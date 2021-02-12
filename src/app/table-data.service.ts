import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableDataService {
  constructor(
    private http: HttpClient,
  ) {
  }

  getLocalData(): Observable<any[]> {
    return this.http.get<any[]>('./assets/data/data-sample.json');
  }

  getMongoData(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/data');
  }

  uploadFile(fileName: String): Observable<any[]> {
    return this.http.post<any[]>('http://localhost:8080/api/upload', {fileName});
  }
}
