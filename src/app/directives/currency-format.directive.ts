// import { Directive, ElementRef, HostListener } from '@angular/core';
// import { NgControl } from '@angular/forms';
// import { CurrencyPipe } from '@angular/common';

// @Directive({
//   selector: '[appCurrencyFormat]'
// })
// export class CurrencyFormatDirective {
//   constructor(private el: ElementRef, private control: NgControl, private currencyPipe: CurrencyPipe) {}

//   @HostListener('input', ['$event.target.value'])
//   onInput(value: string) {
//     const formattedValue = this.formatCurrency(value);
//     this.control.control!.setValue(formattedValue, { emitEvent: false });
//     this.el.nativeElement.value = formattedValue;
//   }

//   formatCurrency(value: string): string| null {
//     // Your currency formatting logic here
//     return this.currencyPipe.transform(value, 'GBP');
//   }
// }