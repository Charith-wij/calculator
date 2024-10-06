import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss']
})
export class CustomInputComponent {
  value: string = '';

  onValueChange(newValue: string): void {
    // Remove everything that is not a number or a decimal point
    const cleanValue = newValue.replace(/[^0-9.]/g, '');

    // Convert to a number (handling NaN if not a valid number)
    const numberValue = parseFloat(cleanValue);
    if (isNaN(numberValue)) {
      this.value = ''; // Reset value if invalid
    } else {
      // Format the number to include commas and two decimal places
      this.value = numberValue.toLocaleString();
    }
  }

  allowOnlyNumber(event: KeyboardEvent): void {
    const keyCode = event.which || event.keyCode;
    // Allow numbers, comma, and point for decimal
    if (!/[0-9.,]/.test(event.key) && keyCode !== 8) {
      event.preventDefault();
    }
  }
}