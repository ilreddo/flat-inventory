import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';

const constURL = `${environment.constURL}/api`;

@Injectable()
export class ApartmentService {

  constructor( private http: Http ) { }

  // error handler
  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  searchApartments(search: string): any {
    const url = search != null ? `${constURL}/apartments/query${search}` : `${constURL}/apartments/`;
    return this.http.get(url)
      .map(res => res.json().apartment)
      .catch(this.handleError)
  }

  getApartments(): any {
    return this.http.get(`${constURL}/apartments`)
      .map(res => res.json())
      .catch(this.handleError)
  }

  getOneApartment(id: any): any {
    return this.http.get(`${constURL}/apartments/query?_id=${id}`)
      .map(res =>  res.json().apartments)
      .catch(this.handleError)
  }

  getApartmentItems(id: any): any {
    return this.http.get(`${constURL}/apartments/query?_id=${id}`)
      .map(res =>  res.json())
      .catch(this.handleError)
  }

  createApartment(apartment: object): any {
    return this.http.post(`${constURL}/apartments`, apartment)
      .map(res =>  res.json().apartment )
      .catch(this.handleError)
  }

  editApartment(id: string, apartment: object): any {
    return this.http.patch(`${constURL}/apartments/${id}`, apartment)
      .map(res => res.json())
      .catch(this.handleError);
  }

  deleteApartment(id: string): any {
    return this.http.delete(`${constURL}/apartments/${id}`)
      .map(res => res.json())
      .catch(this.handleError);
  }
}