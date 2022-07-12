import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Register } from './models/register.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Login } from './models/login.model';
import { Token } from './models/token.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient) { }

  register(register:Register) {
    return this.http.post(environment.serverURL + '/api/users', register);
  }

  login(login:Login) : Observable<Token> {
    return this.http.post<Token>(environment.serverURL + '/api/users/login', login);
  }
}