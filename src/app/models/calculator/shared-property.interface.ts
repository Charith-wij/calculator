import { Timestamp } from '@angular/fire/firestore';

export interface SharedProperty {
    id: string;
    propertyData: any;  // Your form data
    sharedBy: string;   // User ID who shared
    sharedAt: Timestamp;
    expiresAt?: Timestamp;  // Optional expiry
    accessCode?: string;    // Optional security
}