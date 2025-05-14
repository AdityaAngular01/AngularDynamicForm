import { CommonModule, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, ValidatorFn } from '@angular/forms';
import { LucideAngularModule, Menu, Move, MoveDown, MoveUp, Settings2, SquarePen, Trash, X } from 'lucide-angular';
import { CodeGeneratorComponent } from './code-generator/code-generator.component';

type inputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'radio' | 'select' | 'checkbox' | 'date' | 'blank';

export interface IValidations {
  required?: boolean;
  email?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  minLength?: number;
}

export interface DynamicField {
  title:string;
  name: string;
  type: inputType;
  options?: string[] | undefined | null;
  placeholder?: string | undefined | null;
  width?: string; // Now using col-span-* for grid layout
  validations?: IValidations
}

@Component({
  selector: 'app-dynamic-form',
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    CommonModule,
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

  protected isSidebarOpen: boolean = false;


  protected fields: DynamicField[] = [];
  protected inputTypes: inputType[] = [
    'text',
    'email',
    'password',
    'tel',
    'url',
    'date',
    'search',
    'radio',
    'select',
    'checkbox',
    'blank'
  ];
  protected fieldsWidths = [
    { title: 'Full Width', className: 'col-span-12' },
    { title: 'Two Third Width', className: 'md:col-span-8' },
    { title: 'Half Width', className: 'md:col-span-6' },
    { title: 'One Third Width', className: 'md:col-span-4' },
    { title: 'One Fourth Width', className: 'md:col-span-3' }
  ];

  protected generatedCode: string = '';

  protected dynamicForm!: FormGroup;
  protected fieldForm!: FormGroup;
  protected validationForm!: FormGroup;


  protected editedField!: DynamicField | null;

  protected validationOnFieldIndex: number = 0;
  protected isValidationFormOpen: boolean = false;

  protected icons = {
    edit: SquarePen,
    delete: Trash,
    menu: Menu,
    closeMenu: X,
    drag: Move,
    arrowUp: MoveUp,
    arrowDown: MoveDown,
    validations: Settings2
  };


  constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    this.dynamicForm = formBuilder.group({});
  }

  ngOnInit(): void {
    this.initFieldForm();
    this.initValidationForm();
    this.initDummyform();
  }

  private initDummyform() :void {
    const initialFields: DynamicField[] = [
      {
        title: 'full Name',
        name: 'fullName',
        type: 'text',
        placeholder: 'Enter your full name',
        width: 'md:col-span-4'
      },
      {
        title: 'email',
        name: 'email',
        type: 'email',
        placeholder: 'Enter your email',
        width: 'md:col-span-4'
      },
      {
        title: 'password',
        name: 'password',
        type: 'password',
        placeholder: 'Enter your password',
        width: 'md:col-span-4'
      },
      {
        title: 'Phone Number',
        name: 'phoneNumber',
        type: 'tel',
        placeholder: 'Enter your phone number',
        width: 'md:col-span-6'
      },
      {
        title: 'website',
        name: 'website',
        type: 'url',
        placeholder: 'Enter your website URL',
        width: 'md:col-span-6'
      },
      {
        title: 'search Query',
        name: 'searchQuery',
        type: 'search',
        placeholder: 'Search here',
        width: 'md:col-span-4'
      },
      {
        title: 'gender',
        name: 'gender',
        type: 'radio',
        options: ['Male', 'Female', 'Other'],
        width: 'md:col-span-8'
      },
      {
        title: 'country',
        name: 'country',
        type: 'select',
        options: ['USA', 'India', 'Germany'],
        width: 'md:col-span-4'
      },
      {
        title: 'subscribe',
        name: 'subscribe',
        type: 'checkbox',
        options: ['Yes', 'No'],
        width: 'md:col-span-8'
      }
    ];

    initialFields.forEach(f => {
      this.fields.push(f);
      this.dynamicForm.addControl(f.name, this.formBuilder.control(''));
    });
  }

  private initFieldForm() :void  {
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

  private initValidationForm() :void {
    this.validationForm = this.formBuilder.group({
      required: [false],
      email: [false],
      minLength: [''],
      maxLength: [''],
      pattern: [''],
      min: [''],
      max: ['']
    });
  }

  protected fieldModal() :void {
    this.isSidebarOpen = false;
    this.showOverlay.set(!this.showOverlay());
  }

  protected clearDummyForm() : void{
    let interval = setInterval(() => {
      if (this.fields.length > 0) {
        this.fields.pop();
      } else {
        clearInterval(interval);
      }
    }, 500);

  }


  async saveField() {
    const { fieldName, fieldType, fieldPlaceholder, fieldOptions, fieldWidth } = this.fieldForm.value;

    const newField: DynamicField = {
      title: fieldName,
      name: await this.codeGenerator.fieldNameConverter(fieldName),
      type: fieldType,
      placeholder: fieldPlaceholder,
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? fieldOptions.split(",").map((f: string) => f.trim()) : undefined,
      width: fieldWidth
    };

    this.fields.push(newField);
    this.dynamicForm.addControl(fieldName, this.formBuilder.control(''));
    this.fieldForm.reset();
    this.fieldModal();
  }


  editField(field: DynamicField) {
    this.fieldForm.patchValue({
      fieldName: field.title,
      fieldType: field.type,
      fieldPlaceholder: field.placeholder,
      fieldOptions: field.options?.join(', '),
      fieldWidth: field.width
    });
    this.isSidebarOpen = false;
    this.editedField = field;
    this.fieldModal();
  }

  deleteField(index: number) {
    this.dynamicForm.removeControl(this.fields[index].name);
    this.fields.splice(index, 1);
  }

  async onSaveEditedField() {
    const { fieldName, fieldType, fieldPlaceholder, fieldOptions, fieldWidth } = this.fieldForm.value;
    const field: DynamicField = {
      title: fieldName,
      name: await this.codeGenerator.fieldNameConverter(fieldName),
      type: fieldType,
      placeholder: fieldPlaceholder,
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? fieldOptions.split(',').map((f: string) => f.trim()) : undefined,
      width: fieldWidth,
      validations: this.editedField?.validations
    };

    if (this.editedField?.name !== field.name) {
      this.dynamicForm.removeControl(this.editedField?.name as string);
      this.dynamicForm.addControl(field.name, this.formBuilder.control(''));
    }

    this.fields[this.fields.indexOf(this.editedField!)] = field;
    this.editedField = null;
    this.fieldModal();
  }


  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  screenIsSmall(): boolean {
    return window.innerWidth < 768;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // this.generateCode();
      this.cdr.detectChanges();
    });
  }

  addNewField(){
    this.editedField = null;
    this.fieldForm.reset();
    this.fieldModal();
  }

  generateCode(type:'HTML_Taiwind' | 'HTML_Taiwind_Angular' | 'Angular_TS'): void {

    if (this.codeGenerator && type === 'HTML_Taiwind') {
      this.generatedCode = this.codeGenerator.generateCode(this.fields);
      this.copyGeneratedCode();
    }else if(this.codeGenerator && type === 'HTML_Taiwind_Angular'){
      this.generatedCode = this.codeGenerator.generateAngularHTMLCode(this.fields);
      this.copyGeneratedCode();
    }else if(this.codeGenerator && type === 'Angular_TS'){
      this.generatedCode = this.codeGenerator.generateTsCode(this.fields);
      this.copyGeneratedCode();
    }
  }

  copyGeneratedCode() {
    if (this.generatedCode) {
      navigator.clipboard.writeText(this.generatedCode).then(() => {
        alert('Code copied to clipboard!');
      }).catch(err => {
        alert('Failed to copy code.');
        console.error(err);
      });
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


  private async generateValidatorsFromForm(): Promise<ValidatorFn[]> {
    const val = this.validationForm.value;
    return await this.codeGenerator.generateValidators(val)
  }

  resetValidation() {
    this.validationOnFieldIndex = 0;
    this.validationForm.reset();
  }
  toggleValidationForm(index?: number) {
    this.validationOnFieldIndex = index || 0;
    this.validationForm.patchValue(this.fields[index || 0].validations!)
    this.isValidationFormOpen = !this.isValidationFormOpen;
  }

  closeModal() {
    this.toggleValidationForm();
    this.resetValidation();
  }

  async applyValidation() {
    const controlName = this.fields[this.validationOnFieldIndex].name;
    this.dynamicForm.get(controlName)?.clearValidators();
    this.dynamicForm.get(controlName)?.addValidators(await this.generateValidatorsFromForm());
    this.fields[this.validationOnFieldIndex] = { ...this.fields[this.validationOnFieldIndex], validations: this.validationForm.value }
    this.closeModal();
  }

  onSubmitForm() {
    if (this.dynamicForm.invalid) {
      this.dynamicForm.markAllAsTouched();
      alert("invalid form");
      return;
    }
    alert("form submitted")
  }
}
