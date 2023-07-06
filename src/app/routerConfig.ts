import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { HistoryComponent } from './components/history/history.component';
import { RegisterComponent } from './components/register/register.component';


const appRoutes: Routes = [
  { path: 'login', 
    component: LoginComponent 
  },
  { path: 'register', 
    component: RegisterComponent
  },
  { path: 'history', 
    component: HistoryComponent 
  },
  {
    path: '',
    component: MainComponent,
    pathMatch: 'full'
  },
];
export default appRoutes;