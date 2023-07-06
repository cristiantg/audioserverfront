import { Component, EventEmitter, Output } from '@angular/core';
declare var $: any;
import * as RecordRTC from 'recordrtc';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './api-rest/api/auth.service';
import { LoginDTO } from './api-rest/model/loginDTO';
import { UsersService } from './api-rest/api/users.service';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { UpdateAudioDTO } from './api-rest/model/updateAudioDTO';
import { Observable, timer } from 'rxjs';
import { RouterModule, Routes } from '@angular/router';
import {TranslateService} from "@ngx-translate/core";
declare var require: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})


export class AppComponent {
  localesList = [
    { code: 'en-US', label: 'English' },
    { code: 'es', label: 'Español' }
  ];
  constructor(public translate: TranslateService) {
    translate.setDefaultLang('en-US');
    translate.use('en-US');
  }

  ngOnInit() {
   
  }

  useLanguage(language: string): void {
    this.translate.use(language);
}



}

