import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
