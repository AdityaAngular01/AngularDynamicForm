import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'Dynamic-Form',
    loadComponent: ()=> import("./dynamic-form/dynamic-form.component").then(component=> component.DynamicFormComponent),
    title: "Angular Dynamic Form Generator"
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'Dynamic-Form'
  }
];
