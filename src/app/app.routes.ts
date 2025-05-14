import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: ()=> import("./dynamic-form/dynamic-form.component").then(component=> component.DynamicFormComponent),
    title: "Dynamic Form Generator"
  },
];
