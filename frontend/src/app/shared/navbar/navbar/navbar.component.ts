import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Login } from '../../models/login.model';
import { Token } from '../../models/token.model';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  loginForm = new FormGroup({
    Email : new FormControl("", Validators.required),
    Password : new FormControl("", Validators.required),
  });

  constructor(private service: UserService, private router: Router, private toastr: ToastrService) { }


  ngOnInit(): void {
    if (localStorage.getItem('token') != null)
    this.router.navigateByUrl('/');
  this.isSignin();
}

show: boolean = false;

isSignin() {
  if (localStorage.getItem('token') != null)
    this.show = true;
  }
  onSubmit() {
    if(this.loginForm.valid){
      let login:Login = new Login();
      login.email = this.loginForm.controls['Email'].value;
      login.password = this.loginForm.controls['Password'].value;

      this.service.login(login).subscribe(
        (data : Token) => {
          localStorage.setItem('token', data.token);
          this.isSignin();
          this.router.navigateByUrl('/');
        },
        error => {
            this.toastr.error('Incorrect email or password.', 'Authentication failed.');
        }
      );
      this.loginForm.reset();
    }
    else{
      this.toastr.error('Didnt input email or password.', 'Log in failed.');
      this.loginForm.reset();
    }
  }


}
