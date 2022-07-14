import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Login } from '../models/login.model';
import { Token } from '../models/token.model';
import { UserService } from '../user.service';
import jwt_decode from "jwt-decode";
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { SocialUser } from "@abacritt/angularx-social-login";
import { Register } from '../models/register.model';
import { SocialLoginUser } from '../models/sociallogin.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  
  constructor(private service: UserService, private router: Router, private toastr: ToastrService, route:ActivatedRoute, private sanitizer: DomSanitizer) {}

  loginForm = new FormGroup({
    Email : new FormControl("", Validators.required),
    Password : new FormControl("", Validators.required),
  });

  show: boolean = false;
  token: string = "";
  name: string = "";
  decoded:any;
  profilePicture:any;
  user: SocialUser = new SocialUser;
  role:string = "";

  ngOnInit(): void {
    this.service.subscriber$.subscribe(data => {
      if(data as string !== "profilepicture")
        this.name = data as string;
      this.isSignin();
    });
    this.service.subscriber1$.subscribe(data => {
      this.show = data as boolean;
    });
    
    if (localStorage.getItem('token') != null){
      this.router.navigateByUrl('/');
    }
    this.isSignin();
  }

  externalLogin(){
    this.service.signInWithFacebook()
  .then(res => {
    this.user = { ...res };

    let login = new SocialLoginUser();
    login.name = this.user.firstName;
    login.lastname = this.user.lastName;
    login.email = this.user.email;
    login.photoUrl = this.user.photoUrl;
    login.id = this.user.id;
    login.provider = this.user.provider;
    
    this.service.socialLogin(login).subscribe({
      next: (data : Token) => {
        localStorage.setItem('token', data.token);
        this.isSignin();
        this.router.navigateByUrl('/dashboard');
      },
      error: (error) => {
          this.toastr.error('Invalid credentials');
      }
    });

  }, error => console.log(error))
  }

  isSignin() {
    if (localStorage.getItem('token') != null){
      this.show = true;
      const temp = localStorage.getItem('token');
      this.token = temp !== null ? temp : "";
      this.decoded = jwt_decode(this.token);
      this.name = this.decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      this.role = this.decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if(this.role != 'social'){
        this.service.getImage().subscribe({
          next: (data) =>{
            if(data !== null){
              let objectURL = URL.createObjectURL(data); 
              this.profilePicture = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            }
            else
            this.profilePicture = "../../../assets/images/profile-pic-placeholder.png";
          },
          error: (error) =>{
            this.profilePicture = "../../../assets/images/profile-pic-placeholder.png";
          }
        });
      }
      else{
        this.service.getSocialImage().subscribe({
          next: (data) =>{
            if(data !== null){
              this.profilePicture = data;
            }
            else
              this.profilePicture = "../../../assets/images/profile-pic-placeholder.png";
          },
          error: (e) =>{
            console.log(e);
            this.profilePicture = "../../../assets/images/profile-pic-placeholder.png";
          }
        });
      }
    }
    else{
      this.show = false;
      this.profilePicture = "";
    }
  }

  onSubmit() {
    if(this.loginForm.valid){
      let login:Login = new Login();
      login.email = this.loginForm.controls['Email'].value;
      login.password = this.loginForm.controls['Password'].value;

      this.service.login(login).subscribe({
        next: (data : Token) => {
          if(data === null){
            this.toastr.error('Invalid credentials');
            return;
          }
          localStorage.setItem('token', data.token);
          this.isSignin();
          this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
            this.toastr.error('Invalid credentials.');
        }
      });
      this.loginForm.reset();
    }
    else{
      this.toastr.info('Fill out all the fields.');
      this.loginForm.reset();
    }
  }

  logOut(){
    this.profilePicture = "";
    localStorage.removeItem('token');
    this.router.navigateByUrl('/').then(() =>{
      window.location.reload();
    });
    
  }
}
