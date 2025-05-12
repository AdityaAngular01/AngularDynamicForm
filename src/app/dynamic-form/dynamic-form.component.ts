import { CommonModule, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LucideAngularModule, SquarePen, Trash } from 'lucide-angular';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

type inputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'radio' | 'select' | 'checkbox' | 'date' | 'blank';

interface DynamicField {
  name: string;
  type: inputType;
  options?: string[] | undefined | null;
  placeholder?: string | undefined | null;
  width?: string; // Now using col-span-* for grid layout
}

@Component({
  selector: 'app-dynamic-form',
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    CommonModule,
    DragDropModule,
    FormsModule,
    LowerCasePipe,
    LucideAngularModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit {
  protected icons = {
    edit: SquarePen,
    delete: Trash
  };
  protected showOverlay = signal<boolean>(false);
  protected showSelect = signal<boolean>(false);
  protected fields: DynamicField[] = [];
  protected dynamicForm!: FormGroup;
  protected fieldForm!: FormGroup;
  protected inputTypes: inputType[] = ['text', 'email', 'password', 'tel', 'url', 'date', 'search', 'radio', 'select', 'checkbox', 'blank'];

  constructor(private formBuilder: FormBuilder) {
    this.dynamicForm = formBuilder.group({});
  }

  ngOnInit(): void {
    this.initFieldForm();

    const initialFields: DynamicField[] = [
      {
        name: 'full Name',
        type: 'text',
        placeholder: 'Enter your full name',
        width: 'col-span-4'
      },
      {
        name: 'email',
        type: 'email',
        placeholder: 'Enter your email',
        width: 'col-span-4'
      },
      {
        name: 'password',
        type: 'password',
        placeholder: 'Enter your password',
        width: 'col-span-4'
      },
      {
        name: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter your phone number',
        width: 'col-span-6'
      },
      {
        name: 'website',
        type: 'url',
        placeholder: 'Enter your website URL',
        width: 'col-span-6'
      },
      {
        name: 'search Query',
        type: 'search',
        placeholder: 'Search here',
        width: 'col-span-4'
      },
      {
        name: 'gender',
        type: 'radio',
        options: ['Male', 'Female', 'Other'],
        width: 'col-span-8'
      },
      {
        name: 'country',
        type: 'select',
        options: ['USA', 'India', 'Germany'],
        width: 'col-span-4'
      },
      {
        name: 'subscribe',
        type: 'checkbox',
        options: ['Yes', 'No'],
        width: 'col-span-8'
      }
    ];

    initialFields.forEach(f => {
      this.fields.push(f);
      this.dynamicForm.addControl(f.name, this.formBuilder.control('', Validators.required));
    });
  }

  // protected fieldsWidths = [
  //   { title: 'Full Width', className: 'col-span-full' },
  //   { title: 'One Third Width', className: 'col-span-1' },
  //   { title: 'Two Third Width', className: 'col-span-2' },
  // ];

  protected fieldsWidths = [
    { title: 'Full Width', className: 'col-span-12' },
    { title: 'Two Third Width', className: 'col-span-8' },
    { title: 'Half Width', className: 'col-span-6' },
    { title: 'One Third Width', className: 'col-span-4' },
    { title: 'One Fourth Width', className: 'col-span-3' }
  ];



  initFieldForm() {
    this.fieldForm = this.formBuilder.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      fieldPlaceholder: [''],
      fieldOptions: [''],
      fieldWidth: ['', Validators.required]
    });

    this.fieldForm.get('fieldType')?.valueChanges.subscribe(type => {
      const optionsControl = this.fieldForm.get('fieldOptions');
      if (['select', 'radio', 'checkbox'].includes(type)) {
        optionsControl?.setValidators([Validators.required]);
        this.showSelect.set(true);
      } else {
        optionsControl?.clearValidators();
        this.showSelect.set(false);
      }
      optionsControl?.updateValueAndValidity();
    });
  }

  fieldModal() {
    this.showOverlay.set(!this.showOverlay());
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
  }

  saveField() {
    const { fieldName, fieldType, fieldPlaceholder, fieldOptions, fieldWidth } = this.fieldForm.value;

    const newField: DynamicField = {
      name: fieldName,
      type: fieldType,
      placeholder: fieldPlaceholder,
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? fieldOptions.split(",").map((f: string) => f.trim()) : undefined,
      width: fieldWidth
    };

    this.fields.push(newField);
    this.dynamicForm.addControl(fieldName, this.formBuilder.control('', Validators.required));
    this.fieldForm.reset();
    this.fieldModal();
  }

  protected editedField!: DynamicField | null;

  editField(field: DynamicField) {
    this.fieldForm.patchValue({
      fieldName: field.name,
      fieldType: field.type,
      fieldPlaceholder: field.placeholder,
      fieldOptions: field.options?.join(', '),
      fieldWidth: field.width
    });
    this.editedField = field;
    this.fieldModal();
  }

  deleteField(index: number) {
    this.dynamicForm.removeControl(this.fields[index].name);
    this.fields.splice(index, 1);
  }

  onSaveEditedField() {
    const { fieldName, fieldType, fieldPlaceholder, fieldOptions, fieldWidth } = this.fieldForm.value;
    const field: DynamicField = {
      name: fieldName,
      type: fieldType,
      placeholder: fieldPlaceholder,
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? fieldOptions.split(',').map((f: string) => f.trim()) : undefined,
      width: fieldWidth
    };

    if (this.editedField?.name !== field.name) {
      this.dynamicForm.removeControl(this.editedField?.name as string);
      this.dynamicForm.addControl(field.name, this.formBuilder.control('', Validators.required));
    }

    this.fields[this.fields.indexOf(this.editedField!)] = field;
    this.editedField = null;
    this.fieldModal();
  }

  protected generatedCode: string = '';

  generateCode() {
    let code = `<form class="grid grid-cols-1 sm:grid-cols-12 md:grid-cols-12 gap-4 p-4 w-full">\n`;

    this.fields.forEach(field => {
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
          field.options.forEach(opt => {
            code += `      <option value="${opt}">${opt}</option>\n`;
          });
          code += `    </select>\n`;
        }

        else if (field.type === 'radio' && field.options?.length) {
          code += `    <div class="flex gap-4 mt-3">\n`;
          field.options.forEach(opt => {
            code += `      <label class="inline-flex items-center gap-2">\n`;
            code += `        <input type="radio" name="${field.name}" value="${opt}" /> <span>${opt}</span>\n`;
            code += `      </label>\n`;
          });
          code += `    </div>\n`;
        }

        else if (field.type === 'checkbox' && field.options?.length) {
          code += `    <div class="space-y-2 mt-2">\n`;
          field.options.forEach((opt, i) => {
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
    this.generatedCode = code;
  }


  // In your .ts file
isSidebarOpen: boolean = false;

toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

screenIsSmall(): boolean {
  return window.innerWidth < 768;
}


}
