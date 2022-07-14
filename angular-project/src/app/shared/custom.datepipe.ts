import { Pipe, PipeTransform } from '@angular/core';
   import { DatePipe } from '@angular/common';
   
   @Pipe({
     name: 'customDate'
   })
   export class CustomDatePipe extends 
                DatePipe implements PipeTransform {
     override transform(value: any, args?: any): any {
        value = new Date(value).toLocaleDateString('en-GB') + " " + new Date(value).toLocaleTimeString('en-GB');
        return value;
     }
   }