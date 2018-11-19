import { Component, OnInit } from '@angular/core';
import {
  NgForm,
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';

import { Customer } from './customer';
import {debounceTime} from 'rxjs/operators';

function getValidator(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value != null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { range: true };
    }
    return null;
  };
}

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  let emailControl = c.get('email');
  let confirmControl = c.get('confirmEmail');
  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }
  if (emailControl.value == confirmControl.value) {
    return null;
  } else {
    return { match: true };
  }
}

@Component({
  selector: 'app-customer-reactive',
  templateUrl: './customer-reactive.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerReactiveComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();
  private validationMessages = {
    required: 'Please enter your email address',
    email: 'Please enter a valid email address'
  };
  emailMessage:string;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.customerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: { value: 'mehta', disabled: true },
      emailGroup: this.formBuilder.group(
        {
          email: ['', [Validators.required, Validators.email]],
          confirmEmail: ['', Validators.required]
        },
        { validator: emailMatcher }
      ),
      sendCatalog: true,
      phone: '',
      notification: 'email',
      rating: [null, getValidator(1, 5)]
    });
    this.customerForm.get('notification').valueChanges.subscribe(value => {
      let phoneControl = this.customerForm.get('phone');
      if (notifyVia == 'phone') {
        phoneControl.setValidators([Validators.required]);
      } else {
        phoneControl.clearValidators();
      }
    });
    this.customerForm.get('emailGroup.email').valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(value=>{
      this.setMessage(this.customerForm.get('emailGroup.email'));
    });
  }

  setMessage(c:AbstractControl){
    this.emailMessage = '';
    if((c.touched || c.dirty) && c.errors){
      this.emailMessage = Object.keys(c.errors).map(
        key => this.emailMessage+= this.validationMessages[key]).join(' ');
      );
    }
  }


  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }
  populateTestData() {
    this.customerForm.patchValue({
      firstName: 'Nishant',
      email: 'nishme@gmail.com'
    });
  }

  setNotification(notifyVia: string) {
    let phoneControl = this.customerForm.get('phone');
    if (notifyVia == 'phone') {
      phoneControl.setValidators([Validators.required]);
    } else {
      phoneControl.clearValidators();
    }
  }
}
