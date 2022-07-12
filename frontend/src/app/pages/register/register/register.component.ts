import { Component, OnInit } from '@angular/core';
import { NgForm, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Register } from 'src/app/shared/models/register.model';
import { UserService } from 'src/app/shared/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm = new FormGroup({
    Username: new FormControl('', Validators.required),
    Name: new FormControl('', Validators.required),
    Lastname: new FormControl('', Validators.required),
    BirthDate: new FormControl('', Validators.required),
    Address: new FormControl('', Validators.required),
    Email: new FormControl('', Validators.required),
    Type: new FormControl('', Validators.required),
    Password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  constructor(private service: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    let register:Register = new Register();
    register.username = this.registerForm.controls['Username'].value;
    register.name = this.registerForm.controls['Name'].value;
    register.lastname = this.registerForm.controls['Lastname'].value;
    register.birthDate = this.registerForm.controls['BirthDate'].value;
    register.address = this.registerForm.controls['Address'].value;
    register.email = this.registerForm.controls['Email'].value;
    register.password = this.registerForm.controls['Password'].value;
    register.type = this.registerForm.controls['Type'].value;

    this.service.register(register).subscribe(
      (_data) => {
        this.router.navigateByUrl('/');
      },
      error => {
          this.toastr.error('Incorrect input.', 'Registration failed.');
      }
    );
  }

}
