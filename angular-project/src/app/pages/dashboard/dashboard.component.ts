import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import jwt_decode from "jwt-decode";
import { NgForm, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Register } from 'src/app/shared/models/register.model';
import { Token } from 'src/app/shared/models/token.model';
import { ChangePassword } from 'src/app/shared/models/changePassword.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  panelOpenState = false;
  panelOpenState1 = false;
  @Output() changed = new EventEmitter<string>();

  constructor(private service: UserService, private router: Router, private toastr: ToastrService, private sanitizer: DomSanitizer) { }

  changeUserForm = new FormGroup({
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

  changeSocialUserForm = new FormGroup({
    Username: new FormControl('', Validators.required),
    Name: new FormControl('', Validators.required),
    Lastname: new FormControl('', Validators.required),
    BirthDate: new FormControl('', Validators.required),
    Address: new FormControl('', Validators.required),
    Email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
    Type: new FormControl('', Validators.required)
  });

  changePasswordForm = new FormGroup({
    PasswordOld: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4)])),
    passwordRepOld: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4)])),
    PasswordNew: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4)])),
    passwordRepNew: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4)]))
  });

  role:string="";
  decoded:any;
  profilePicture:any;
  files:File[] = [];
  email:string = "";

  ngOnInit(): void {
    const temp = localStorage.getItem('token');
    const token = temp !== null ? temp : "";
    this.decoded = jwt_decode(token);
    this.role = this.decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    
    //ucitavanje elemenata za izmenu
    this.service.getUserInfo().subscribe({
      next: (data : Register) => {
        if(this.role != 'social'){
          this.changeUserForm.setValue({
            Username: data.username,
            Name: data.name,
            Lastname: data.lastname,
            BirthDate: new Date(data.birthDate).toLocaleDateString('pt-br').split( '/' ).reverse( ).join( '-' ),
            Address: data.address,
            Email: data.email,
            Type: data.type,
            Password: "",
            passwordRep: "",
          });
        }
        else{
          this.changeSocialUserForm.setValue({
            Username: data.username,
            Name: data.name,
            Lastname: data.lastname,
            BirthDate: new Date(data.birthDate).toLocaleDateString('pt-br').split( '/' ).reverse( ).join( '-' ),
            Address: data.address,
            Email: data.email,
            Type: data.type
          });
        }

        this.email = data.email;
      },
      error: (error) => {
          this.toastr.error(error.error, 'Error');
          localStorage.removeItem('token');
          this.router.navigateByUrl('/');
          return;
      }
    });
    
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
        error: (e) =>{
          console.log(e);
          this.profilePicture = "../../../assets/images/profile-pic-placeholder.png";
        }
      });
    }
    else {
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

  onSubmit(){
    let register:Register = new Register();
    if(this.role != 'social'){
      if(this.changeUserForm.invalid){
        this.toastr.error('Fill all the fields before change.');
        return;
      }

      register.username = this.changeUserForm.controls['Username'].value;
      register.name = this.changeUserForm.controls['Name'].value;
      register.lastname = this.changeUserForm.controls['Lastname'].value;
      register.birthDate = this.changeUserForm.controls['BirthDate'].value;
      register.address = this.changeUserForm.controls['Address'].value;
      register.email = this.changeUserForm.controls['Email'].value;
      register.password = this.changeUserForm.controls['Password'].value;
      register.type = Number(this.changeUserForm.controls['Type'].value);

      if(register.password != this.changeUserForm.controls['passwordRep'].value){
        this.toastr.error('Passwords do not match');
        return;
      }
    }
    else{
      if(this.changeSocialUserForm.invalid){
        this.toastr.error('Fill all the fields correctly.');
        return;
      }

      register.username = this.changeSocialUserForm.controls['Username'].value;
      register.name = this.changeSocialUserForm.controls['Name'].value;
      register.lastname = this.changeSocialUserForm.controls['Lastname'].value;
      register.birthDate = this.changeSocialUserForm.controls['BirthDate'].value;
      register.address = this.changeSocialUserForm.controls['Address'].value;
      register.email = this.changeSocialUserForm.controls['Email'].value;
      register.type = Number(this.changeSocialUserForm.controls['Type'].value);
    }

    this.service.changeUserInfo(register).subscribe({
      next: (_data : Token) => {
        localStorage.setItem('token', _data.token);
        this.ngOnInit();
        this.toastr.success('Profile updated.');
        this.service.emitData(register.name + " " + register.lastname);
        this.changeUserForm.controls['Password'].reset();
        this.changeUserForm.controls['passwordRep'].reset();
      },
      error: (error) => {
          if(error.status == 409)
            this.toastr.error(error.error, 'Error');
          else
            this.toastr.error('Error. Please try again.');
          console.log(error);
      }
    });
  }

  onSubmitPass(){
    if(this.changePasswordForm.invalid){
      this.toastr.error('Popuni sva polja ispravno!');
      return;
    }

    let changepassword:ChangePassword = new ChangePassword();
    changepassword.email = this.changeUserForm.controls['Email'].value;
    changepassword.oldpassword = this.changePasswordForm.controls['PasswordOld'].value;
    changepassword.newpassword = this.changePasswordForm.controls['PasswordNew'].value;

    if(changepassword.oldpassword != this.changePasswordForm.controls['passwordRepOld'].value){
      this.toastr.error('Unete stare sifre se ne podudaraju');
      return;
    }

    if(changepassword.newpassword != this.changePasswordForm.controls['passwordRepNew'].value){
      this.toastr.error('Unete nove sifre se ne podudaraju');
      return;
    }

    this.service.changeUserPassword(changepassword).subscribe({
      next: (_data) => {
        this.router.navigateByUrl('/dashboard');
        this.toastr.success('Lozinka uspesno promenjena!')
        this.changePasswordForm.reset();
      },
      error: (error) => {
          if(error.status == 409)
            this.toastr.error('Menjanje lozinke nije uspelo.');
          else
            this.toastr.error('Menjanje lozinke nije uspelo.');
      }
    });
  }

  hasUpload(event:any){
    this.files = event.target.files;
    console.log(this.files[0])
  }

  changeProfilePicture(){
    let fileToUpload = <File>this.files[0];
    const formData = new FormData();
    formData.append(this.changeUserForm.controls['Email'].value, fileToUpload, fileToUpload.name);
    
    this.service.uploadImage(formData).subscribe({
      next: (data) => {
        this.toastr.success('Profilna slika je uspesno izmenjena');
        this.service.emitData("profilePicture");
        this.ngOnInit();
      },
      error: (error) => {
        this.toastr.error('Menjanje slike nije uspelo.');
      }
    });
  }
}


