import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Register } from './models/register.model';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Login } from './models/login.model';
import { Token } from './models/token.model';
import { ChangePassword } from './models/changePassword.model';
import { Product } from './models/product.model';
import { GoogleLoginProvider, SocialAuthService } from "@abacritt/angularx-social-login";
import { FacebookLoginProvider } from "@abacritt/angularx-social-login";
import { SocialLoginUser } from './models/sociallogin.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient, private externalAuthService: SocialAuthService) { }

  register(register:Register) {
    return this.http.post(environment.serverURL + '/api/users', register);
  }

  login(login:Login) : Observable<Token> {
    return this.http.post<Token>(environment.serverURL + '/api/users/login', login);
  }

  socialLogin(login:SocialLoginUser) : Observable<Token> {
    return this.http.post<Token>(environment.serverURL + '/api/users/social-login', login);
  }

  changeUserInfo(changedUser:Register){
    return this.http.post<Token>(environment.serverURL + '/api/users/change', changedUser);
  }

  changeUserPassword(changedPassword:ChangePassword){
    return this.http.post<Token>(environment.serverURL + '/api/users/change-password', changedPassword);
  }

  getUserInfo(){
    return this.http.get<Register>(environment.serverURL + '/api/users/user');
  }

  uploadImage(formData : FormData){
    return this.http.post<FormData>(environment.serverURL + '/api/users/image', formData);
  }

  getImage() : Observable<Blob>{
    return this.http.get(environment.serverURL + '/api/users/image', { responseType: 'blob' });
  }

  getSocialImage(){
    return this.http.get(environment.serverURL + '/api/users/social-image', {responseType: 'text'});
  }

  getAllProducts() : Observable<Product[]>{
    return this.http.get<Product[]>(environment.serverURL + '/api/users/products');
  }

  public signInWithFacebook = ()=> {
    return this.externalAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }
  
  public signOutExternal = () => {
    this.externalAuthService.signOut();
  }

  observer = new Subject();
  public subscriber$ = this.observer.asObservable();
  emitData(data:string) {
    this.observer.next(data);
  }
  
  observerTimeOut = new Subject();
  public subscriber1$ = this.observerTimeOut.asObservable();
  emitData1(data:boolean){
    this.observerTimeOut.next(data);
  }
}
