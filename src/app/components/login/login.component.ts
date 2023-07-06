import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, LoginDTO } from 'src/app/api-rest';
import * as swal from 'sweetalert2'
declare var require: any
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  
  //selector de idiomas
  langSelect:FormGroup

  formLogin: FormGroup

  constructor(
    public _auth: AuthService,
    private _fb: FormBuilder,
    private router: Router,
    public translate: TranslateService) {

      this.langSelect = this._fb.group({
        lang: [{ value:this.translate.currentLang, disabled: false }],
      });

      //Crear el form para el login
      this.formLogin = this._fb.group({
       usuario: [{ value: '', disabled: false }],
       passwd: [{ value: '', disabled: false }],
      });
  }

  login(){
    const swal = require('sweetalert2')

    var login: LoginDTO={
      username:this.formLogin.controls['usuario'].value,
      password:this.formLogin.controls['passwd'].value
    }
    this._auth.loginAuth(login).subscribe(
      (result: any) =>{
        //guardar el token y el nombre de usuario
        localStorage.setItem('tokenAudioServer',result.data.access_token)
        localStorage.setItem('userAudioServer',this.formLogin.controls['usuario'].value)
        this._auth.configuration.accessToken= result.data.access_token
        this._auth.configuration.username= this.formLogin.controls['usuario'].value
        const fecha = new Date();
        localStorage.setItem('fechatoken', fecha.getUTCDay()+'-'+fecha.getUTCMonth()+'-'+fecha.getUTCFullYear());
        //ir a la página principal
        this.router.navigate(['']);
      },(error:any)=>{
        //mostrar por pantalla que ha habido un error
        this.translate.get('login.error').subscribe((res: string) => {
          swal.fire({
            icon: 'error',
            text: res,
          })
      });
        
      }
    )
  }

  registrarse(){
    this.router.navigate(['register']);
  }

  //cambiar de idioma
  useLanguage(event: Event): void {
    const language= (event.target as HTMLInputElement).value;
    this.translate.use(language);
    
}
}
