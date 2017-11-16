import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { environment } from './../environments/environment';

const constURL: string = `${environment.constURL}/api`;
const token = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).token : '';

@Injectable()
export class UserService {

  constructor( private http: Http ) { }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  getUser() {
    let headers = new Headers({ 'Content-Type': 'application/json', 'x-auth': token });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(`${constURL}/users/status`, options)
      .map(res => res.json())
      .catch(this.handleError);
  }

  getInstanceUsers() {
    let headers = new Headers({ 'Content-Type': 'application/json', 'x-auth': token });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(`${constURL}/users/`, options)
      .map(res => res.json().user)
      .catch(this.handleError)
  }

  getOneUser(id: string): any {
    let headers = new Headers({ 'Content-Type': 'application/json', 'x-auth': token });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(`${constURL}/users/query?_id=${id}`, options)
      .map(res => res.json().user)
      .catch(this.handleError);
  }

  newUser(model: any): any {
    let paths = [];
    let headers = new Headers({ 'Content-Type': 'application/json', 'x-auth': token });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${constURL}/users`, model, options)
      .map(res => res.json())
      .catch(this.handleError);
  }

  editUser(id: string, user: any): any {
    let headers = new Headers({ 'Content-Type': 'application/json', 'x-auth': token });
    let option = new RequestOptions({ headers: headers });

    return this.http.patch(`${constURL}/users/updateUser/${id}`, user, option)
      .map(res => res.json().user)
      .catch(this.handleError);
  }

  deleteUser(id: string): any {
    let headers = new Headers({ 'Content-Type': 'application/json', 'x-auth': token });
    let options = new RequestOptions({ headers: headers });
    return this.http.delete(`${constURL}/users/${id}`, options)
      .map(res => res.json())
      .catch(this.handleError);
  }

  submitChangePassword(passwordModel: any, token: string): any {
    const user = localStorage.getItem('currentUser');
    let headers;
    // if token has been submitted then it is a password reset, if there is no token then this is a logged in user request and we can grab token from the storage. We will also set the x-auth-type to auth or reset and this will alter the server request
    if (token === null) {
      // ternary operate that checks if user exists, if not sets token to blank which will send user to login
      token = user ? JSON.parse(user).token : '';
      headers = new Headers({ 'x-auth': token, 'x-auth-type': 'auth' });
    } else {
      headers = new Headers({ 'x-auth': token, 'x-auth-type': 'reset' });
    }

    const options = new RequestOptions({ headers });

    // you returned this already no need to do it twice
    return this.http.patch(`${constURL}/users/profilePasswordChange`, passwordModel, options)
      .map(res => res.json())
      .catch(err => { return Observable.of(false) });
  }

  forgotPassword(email: string) {
    const body = { email };
    return this.http.post(`${constURL}/users/passwordreset`, body)
      .map(res => res.json())
      .catch(err => { return Observable.of(false) });
  }
}