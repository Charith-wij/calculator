import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    constructor() { }

    async convertToBase64(url: string): Promise<string> {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const blob = await response.blob();

            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => reject('Failed to convert to Base64');
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error handling the base64 conversion');
            throw error;
        }
    }
}