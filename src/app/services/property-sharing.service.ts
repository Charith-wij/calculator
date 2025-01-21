import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Timestamp } from "firebase/firestore";

import { SharedProperty } from "../models/calculator/shared-property.interface";
import { SavedItem } from "../models/calculator/saved-figures-item.model";

@Injectable({
    providedIn: 'root'
})
export class PropertySharingService {
    constructor(
        private firestore: AngularFirestore,
        private auth: AngularFireAuth
    ) { }

    async shareProperty(propertyData: SavedItem): Promise<string> {
        const shareId = this.firestore.createId();

        const sharedProperty: SharedProperty = {
            id: shareId,
            propertyData: propertyData,
            sharedBy: await this.getCurrentUserId(),
            sharedAt: Timestamp.fromDate(new Date()),  // Using Timestamp from firebase/firestore
            accessCode: Math.random().toString(36).substring(2, 8)
        };

        // Convert to plain object before saving
        const plainObject = {
            ...sharedProperty,
            sharedAt: sharedProperty.sharedAt.toDate()  // Convert Timestamp to Date
        };

        await this.firestore.collection('shared-properties').doc(shareId).set(plainObject);
        return `${window.location.origin}/load-property/${shareId}`;
    }

    // Load shared property
    async loadSharedProperty(shareId: string): Promise<any> {
        try {
            const doc = await this.firestore
                .collection('shared-properties')
                .doc(shareId)
                .get()
                .toPromise();

            if (!doc?.exists) {
                throw new Error('Shared property not found');
            }

            const data = doc.data() as any;
            console.log('Loaded data from Firestore:', data);

            return data?.propertyData || null;
        } catch (error) {
            console.error('Error loading shared property:', error);
            throw error;
        }
    }

    // Add this method to get current user ID
    private async getCurrentUserId(): Promise<string> {
        const user = await this.auth.currentUser;
        return user?.uid ?? 'anonymous';
    }
}