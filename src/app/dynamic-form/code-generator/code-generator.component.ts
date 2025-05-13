import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-code-generator',
  imports: [CommonModule],
  templateUrl: './code-generator.component.html',
  styleUrl: './code-generator.component.css'
})
export class CodeGeneratorComponent {


  generateCode(fields:any) {
    let code = `<form class="grid grid-cols-1 sm:grid-cols-12 md:grid-cols-12 gap-4 p-4 w-full">\n`;

    fields.forEach((field:any) => {
      const widthClass = field.width || 'col-span-12';
      const baseClass = `p-4 ${field.type === 'blank' ? '!bg-transparent' : 'transition-shadow hover:shadow-xl shadow-lg rounded-xl bg-white'}`;

      code += `  <div class="${widthClass} ${baseClass}">\n`;

      if (field.type !== 'blank') {
        code += `    <label class="block mb-2 font-semibold text-gray-800">${field.name.toUpperCase()}</label>\n`;

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
}
