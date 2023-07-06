import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, RegisterDTO } from 'src/app/api-rest';
import * as swal from 'sweetalert2'
declare var require: any

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  formRegister: FormGroup

  //selector de idioma
  langSelect: FormGroup

  constructor(
    public _auth: AuthService,
    private _fb: FormBuilder,
    private router: Router,
    public translate: TranslateService) {

    this.langSelect = this._fb.group({
      lang: [{ value: this.translate.currentLang, disabled: false }],
    });

    //Crear el form
    this.formRegister = this._fb.group({
      email: [{ value: '', disabled: false }],
      usuario: [{ value: '', disabled: false }],
      passwd: [{ value: '', disabled: false }],
    });

  }
  login() {
    this.router.navigate(['login']);
  }

  registrarse() {
    const swal = require('sweetalert2')
    var register: RegisterDTO = {
      email: this.formRegister.controls['email'].value,
      username: this.formRegister.controls['usuario'].value,
      password: this.formRegister.controls['passwd'].value
    }
    this._auth.registerAuth(register).subscribe(
      (result: any) => {
        //mostrar por pantalla que el registro ha funcionado
        this.translate.get('register.success').subscribe((res: string) => {
          swal.fire({
            icon: 'success',
            text: res,
          })
        });

      }, (error: any) => {
        var title = ''
        var text = ''
        //mostrar por pantalla que campo ha fallado, y el motivo

        if (error.error.invalid_params[0].param == 'username') {

          this.translate.get('register.errors.username').subscribe((res: string) => {
            title = res
          });

          if (error.error.invalid_params[0].reason == 'Invalid value') {

            this.translate.get('register.errors.username.invalid').subscribe((res: string) => {
              text = res
            });

          } else if (error.error.invalid_params[0].reason == 'Username must be between 3 and 20 characters.') {

            this.translate.get('register.errors.username.length').subscribe((res: string) => {
              text = res
            });

          }

        } else if (error.error.invalid_params[0].param == 'email') {

          this.translate.get('register.errors.email').subscribe((res: string) => {
            title = res
          });

          if (error.error.invalid_params[0].reason == 'Invalid value') {

            this.translate.get('register.errors.email.invalid').subscribe((res: string) => {
              text = res
            });

          } else if (error.error.invalid_params[0].reason == 'Error, expected email to be unique.') {

            this.translate.get('register.errors.email.unique').subscribe((res: string) => {
              text = res
            });

          }

        } else if (error.error.invalid_params[0].param == 'password') {

          this.translate.get('register.errors.password').subscribe((res: string) => {
            title = res
          });

          if (error.error.invalid_params[0].reason == 'Invalid value') {

            this.translate.get('register.errors.password.invalid').subscribe((res: string) => {
              text = res
            });

          }

        }

        swal.fire({
          icon: 'error',
          title: title,
          text: text
        })

      }
    )
  }

  useLanguage(event: Event): void {
    const language = (event.target as HTMLInputElement).value;
    this.translate.use(language);

  }

}
