import { Component, OnInit } from '@angular/core';
import { NgForm, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Register } from 'src/app/shared/models/register.model';
import { UserService } from 'src/app/shared/user.service';
import { ToastrService } from 'ngx-toastr';
import { ReturnStatement } from '@angular/compiler';
import { __metadata } from 'tslib';

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
    Email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
    Type: new FormControl('', Validators.required),
    Password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4)])),
    passwordRep: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4)]))
  });
  
  roles = ['Customer', 'Deliverer'];
  message:string = "";
  formData:FormData = new FormData();
  files:File[] = [];

  constructor(private service: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  
  onSubmit() {
    if(this.registerForm.invalid){
      this.toastr.error('Fill all the fields');
      return;
    }

    let register:Register = new Register();
    register.username = this.registerForm.controls['Username'].value;
    register.name = this.registerForm.controls['Name'].value;
    register.lastname = this.registerForm.controls['Lastname'].value;
    register.birthDate = this.registerForm.controls['BirthDate'].value;
    register.address = this.registerForm.controls['Address'].value;
    register.email = this.registerForm.controls['Email'].value;
    register.password = this.registerForm.controls['Password'].value;
    register.type = Number(this.registerForm.controls['Type'].value);
    
    if(register.password != this.registerForm.controls['passwordRep'].value){
      this.toastr.error('Passwords do not match.');
      return;
    }
    
    this.service.register(register).subscribe({
      next: (_data) => {
        if (this.files.length !== 0) {
          this.uploadFile(this.files, register.email);
        }
        this.router.navigateByUrl('/');
        this.toastr.success('Registration successful')
      },
      error: (error) => {
          if(error.status == 409)
            this.toastr.error(error.error, 'Registration failed');
          else
            this.toastr.error('Registration failed');
      }
    });
  }

  hasUpload(event:any){
    this.files = event.target.files;
  }

  uploadFile(files:File[], email:string){
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append(email, fileToUpload, fileToUpload.name);
    
    this.service.uploadImage(formData).subscribe({
      next: (data) => {
        this.message = 'Picture uploaded';
      },
      error: (error) => {
        this.toastr.error('Error');
      }
    });
  }
  
}
