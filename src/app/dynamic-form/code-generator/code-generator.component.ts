import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DynamicField, IValidations } from '../dynamic-form.component';
import { ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-code-generator',
  imports: [CommonModule],
  template: '',
  styles: []
})
export class CodeGeneratorComponent {

  titleCaseConverter(str:string){
    return str.split(' ').map((word:string)=>{
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }

  async fieldNameConverter(fieldName:string):Promise<string>{
    fieldName = this.titleCaseConverter(fieldName);
    return fieldName.charAt(0).toLowerCase().concat(fieldName.slice(1)).split(" ").join("");
  }


  generateCode(fields:DynamicField[]) {
    let code = `<form class="grid grid-cols-1 sm:grid-cols-12 md:grid-cols-12 gap-4 p-4 w-full">\n`;

    fields.forEach((field:DynamicField) => {
      const widthClass = `${field.width} grid-cols-12`;
      const baseClass = `p-4 ${field.type === 'blank' ? '!bg-transparent' : 'transition-shadow hover:shadow-xl shadow-lg rounded-xl bg-white'}`;

      code += `  <div class="${widthClass} ${baseClass}">\n`;

      if (field.type !== 'blank') {
        code += `    <label class="block mb-2 font-semibold text-gray-800">${this.titleCaseConverter(field.title)}</label>\n`;

        if (['text', 'email', 'password', 'tel', 'url', 'search', 'date'].includes(field.type)) {
          code += `    <input type="${field.type}" placeholder="${field.placeholder || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />\n`;
        }

        else if (field.type === 'select' && field.options?.length) {
          code += `    <select class="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">\n`;
          code += `      <option disabled selected>Select ${field.name}</option>\n`;
          field.options.forEach((opt:any) => {
            code += `      <option value="${opt}">${opt}</option>\n`;
          });
          code += `    </select>\n`;
        }

        else if (field.type === 'radio' && field.options?.length) {
          code += `    <div class="flex gap-4 mt-3">\n`;
          field.options.forEach((opt:any) => {
            code += `      <label class="inline-flex items-center gap-2">\n`;
            code += `        <input type="radio" name="${field.name}" value="${opt}" /> <span>${opt}</span>\n`;
            code += `      </label>\n`;
          });
          code += `    </div>\n`;
        }

        else if (field.type === 'checkbox' && field.options?.length) {
          code += `    <div class="space-y-2 mt-2">\n`;
          field.options.forEach((opt:any, i:any) => {
            code += `      <div class="flex items-center gap-2">\n`;
            code += `        <input type="checkbox" value="${opt}" id="${field.name}_${i}" class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />\n`;
            code += `        <label for="${field.name}_${i}" class="text-sm text-gray-700">${opt}</label>\n`;
            code += `      </div>\n`;
          });
          code += `    </div>\n`;
        }
      }

      code += `  </div>\n`;
    });

    code += `</form>`;

    return code;
  }



  async generateValidators(val:IValidations): Promise<ValidatorFn[]> {
    const validators: ValidatorFn[] = [];
    if(!val) return validators;
    if (val.required) validators.push(Validators.required);
    if (val.email) validators.push(Validators.email);
    if (val.minLength) validators.push(Validators.minLength(+val.minLength));
    if (val.maxLength) validators.push(Validators.maxLength(+val.maxLength));
    if (val.min) validators.push(Validators.min(+val.min));
    if (val.max) validators.push(Validators.max(+val.max));
    if (val.pattern) validators.push(Validators.pattern(val.pattern));

    return validators;
  }

  private generateTsValidatorsString(validations?: IValidations): string {
    const validators: string[] = [];
    if (!validations) return '';

    if (validations.required) validators.push('Validators.required');
    if (validations.email) validators.push('Validators.email');
    if (validations.minLength) validators.push(`Validators.minLength(${validations.minLength})`);
    if (validations.maxLength) validators.push(`Validators.maxLength(${validations.maxLength})`);
    if (validations.min) validators.push(`Validators.min(${validations.min})`);
    if (validations.max) validators.push(`Validators.max(${validations.max})`);
    if (validations.pattern) validators.push(`Validators.pattern('${validations.pattern}')`);

    return validators.length > 0 ? `[${validators.join(', ')}]` : '';
  }

  // Generate form TS code
  generateTsCode(fields: DynamicField[]) {
    let code = `protected form!: FormGroup;\n`;
    code += `constructor(private fb: FormBuilder) {}\n\n`;
    code += `ngOnInit() {\n  this.initForm();\n}\n\n`;
    code += `initForm() {\n  this.form = this.fb.group({\n`;

    fields.forEach(field => {
      const validatorsStr = this.generateTsValidatorsString(field.validations);
      code += `    ${field.name}: ['', ${validatorsStr}],\n`;
    });

    code += `  });\n}\n`;

    return code;
  }

  generateAngularHTMLCode(fields:DynamicField[]){
    let code = `<form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-12 md:grid-cols-12 gap-4 p-4 w-full">\n`;

    fields.forEach((field: DynamicField) => {
      const widthClass = `${field.width ?? 'col-span-12'} grid-cols-12`;
      const baseClass = `p-4 ${field.type === 'blank'
        ? '!bg-transparent'
        : 'transition-shadow hover:shadow-xl shadow-lg rounded-xl bg-white'
      }`;

      code += `  <div class="${widthClass} ${baseClass}">\n`;

      if (field.type !== 'blank') {
        code += `    <label class="block mb-2 font-semibold text-gray-800">${this.titleCaseConverter(field.title)}</label>\n`;

        if (['text', 'email', 'password', 'tel', 'url', 'search', 'date'].includes(field.type)) {
          code += `    <input formControlName="${field.name}" type="${field.type}" placeholder="${field.placeholder || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />\n`;
        }

        else if (field.type === 'select' && field.options?.length) {
          code += `    <select formControlName="${field.name}" class="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">\n`;
          code += `      <option disabled selected>Select ${field.title}</option>\n`;
          field.options.forEach((opt: any) => {
            code += `      <option value="${opt}">${opt}</option>\n`;
          });
          code += `    </select>\n`;
        }

        else if (field.type === 'radio' && field.options?.length) {
          code += `    <div class="flex gap-4 mt-3">\n`;
          field.options.forEach((opt: any) => {
            code += `      <label class="inline-flex items-center gap-2">\n`;
            code += `        <input type="radio" formControlName="${field.name}" value="${opt}" /> <span>${opt}</span>\n`;
            code += `      </label>\n`;
          });
          code += `    </div>\n`;
        }

        else if (field.type === 'checkbox' && field.options?.length) {
          code += `    <div class="space-y-2 mt-2">\n`;
          field.options.forEach((opt: any, i: any) => {
            code += `      <div class="flex items-center gap-2">\n`;
            code += `        <input type="checkbox" id="${field.name}_${i}" value="${opt}" class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />\n`;
            code += `        <label for="${field.name}_${i}" class="text-sm text-gray-700">${opt}</label>\n`;
            code += `      </div>\n`;
          });
          code += `    </div>\n`;
        }
      }

      code += `  </div>\n`;
    });

    code += `</form>`;
    return code;
  }
}
