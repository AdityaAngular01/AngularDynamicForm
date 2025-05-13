import { CommonModule, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LucideAngularModule, Menu, Move, MoveDown, MoveUp, SquarePen, Trash, X } from 'lucide-angular';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CodeGeneratorComponent } from './code-generator/code-generator.component';

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
    LucideAngularModule,
    CodeGeneratorComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit, AfterViewInit {
  @ViewChild(CodeGeneratorComponent) codeGenerator!: CodeGeneratorComponent;

  protected showOverlay = signal<boolean>(false);
  protected showSelect = signal<boolean>(false);

  protected fields: DynamicField[] = [];
  protected inputTypes: inputType[] = ['text', 'email', 'password', 'tel', 'url', 'date', 'search', 'radio', 'select', 'checkbox', 'blank'];

  protected generatedCode: string = '';

  protected dynamicForm!: FormGroup;
  protected fieldForm!: FormGroup;

  protected editedField!: DynamicField | null;

  protected icons = {
    edit: SquarePen,
    delete: Trash,
    menu: Menu,
    closeMenu: X,
    drag: Move,
    arrowUp: MoveUp,
    arrowDown: MoveDown
  };


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
        width: 'md:col-span-4'
      },
      {
        name: 'email',
        type: 'email',
        placeholder: 'Enter your email',
        width: 'md:col-span-4'
      },
      {
        name: 'password',
        type: 'password',
        placeholder: 'Enter your password',
        width: 'md:col-span-4'
      },
      {
        name: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter your phone number',
        width: 'md:col-span-6'
      },
      {
        name: 'website',
        type: 'url',
        placeholder: 'Enter your website URL',
        width: 'md:col-span-6'
      },
      {
        name: 'search Query',
        type: 'search',
        placeholder: 'Search here',
        width: 'md:col-span-4'
      },
      {
        name: 'gender',
        type: 'radio',
        options: ['Male', 'Female', 'Other'],
        width: 'md:col-span-8'
      },
      {
        name: 'country',
        type: 'select',
        options: ['USA', 'India', 'Germany'],
        width: 'md:col-span-4'
      },
      {
        name: 'subscribe',
        type: 'checkbox',
        options: ['Yes', 'No'],
        width: 'md:col-span-8'
      }
    ];

    initialFields.forEach(f => {
      this.fields.push(f);
      this.dynamicForm.addControl(f.name, this.formBuilder.control('', Validators.required));
    });
  }

  protected fieldsWidths = [
    { title: 'Full Width', className: 'col-span-12' },
    { title: 'Two Third Width', className: 'md:col-span-8' },
    { title: 'Half Width', className: 'md:col-span-6' },
    { title: 'One Third Width', className: 'md:col-span-4' },
    { title: 'One Fourth Width', className: 'md:col-span-3' }
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




  // In your .ts file
  isSidebarOpen: boolean = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  screenIsSmall(): boolean {
    return window.innerWidth < 768;
  }



  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.generateCode();
    // });
  }

  generateCode(): void {

    if (this.codeGenerator) {
      this.generatedCode = this.codeGenerator.generateCode(this.fields);
      console.log(this.generatedCode);
    }
  }

  moveFieldUp(index: number) {
    if (index > 0) {
      const temp = this.fields[index];
      this.fields[index] = this.fields[index - 1];
      this.fields[index - 1] = temp;
    }
  }

  moveFieldDown(index: number) {
    if (index < this.fields.length - 1) {
      const temp = this.fields[index];
      this.fields[index] = this.fields[index + 1];
      this.fields[index + 1] = temp;
    }
  }



}
