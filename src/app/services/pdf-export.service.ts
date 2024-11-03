import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
    providedIn: 'root'
})
export class PdfExportService {
    private loadingSubject = new Subject<boolean>();
    loading$ = this.loadingSubject.asObservable();

    constructor() { }

    async exportToPDF(): Promise<void> {
        this.loadingSubject.next(true);
        const loadingIndicator = this.showLoadingIndicator();

        try {
            const element = document.getElementById('pdf-content');
            if (!element) {
                throw new Error('PDF content element not found');
            }

            const leftColumn = element.querySelector('.col-8');
            const rightColumn = element.querySelector('.col-4');
            if (!leftColumn || !rightColumn) {
                throw new Error('Column elements not found');
            }

            const [leftWrapper, rightWrapper] = await Promise.all([
                this.prepareWrapper(leftColumn),
                this.prepareWrapper(rightColumn)
            ]);

            // Updated canvas options for better rendering
            const canvasOptions = {
                scale: 2, // Increased for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF', // Explicitly set white background
                imageTimeout: 2000,
                removeContainer: true,
                allowTaint: true,
                foreignObjectRendering: false, // Disabled as it can cause issues
            };

            // Initialize PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
                putOnlyUsedFonts: true
            });

            // Process columns sequentially to ensure proper rendering
            await this.processColumnOptimized(leftWrapper, pdf, 0, canvasOptions);
            await this.processColumnOptimized(rightWrapper, pdf, 1, canvasOptions);

            pdf.save('PropertyDetails.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        } finally {
            this.hideLoadingIndicator(loadingIndicator);
            this.loadingSubject.next(false);
            this.cleanupTemporaryElements();
        }
    }

    private async prepareWrapper(column: Element): Promise<HTMLElement> {
        const wrapper = document.createElement('div');
        const clone = column.cloneNode(true) as HTMLElement;

        // Updated wrapper styles for better rendering
        wrapper.style.cssText = `
            width: 1000px;
            padding: 20px;
            background-color: white;
            position: absolute;
            left: -9999px;
            top: -9999px;
        `;

        clone.classList.remove('col-8', 'col-4');
        clone.classList.add('col-12');

        // Ensure all elements have background color if needed
        this.ensureBackgroundColor(clone);

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        // Wait for any potential dynamic content to render
        await new Promise(resolve => setTimeout(resolve, 100));

        return wrapper;
    }

    private ensureBackgroundColor(element: HTMLElement): void {
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ||
            computedStyle.backgroundColor === 'transparent') {
            element.style.backgroundColor = 'white';
        }

        Array.from(element.children).forEach(child => {
            this.ensureBackgroundColor(child as HTMLElement);
        });
    }

    private async processColumnOptimized(
        wrapper: HTMLElement,
        pdf: jsPDF,
        pageIndex: number,
        canvasOptions: any
    ): Promise<void> {
        try {
            // Make sure wrapper is in the document
            if (!wrapper.isConnected) {
                document.body.appendChild(wrapper);
            }

            // Wait for content to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(wrapper, canvasOptions);

            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm

            // Calculate dimensions while maintaining aspect ratio
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (pageIndex > 0) {
                pdf.addPage();
            }

            // Convert to image with better quality
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Add white background to page
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // Add the image
            pdf.addImage(
                imgData,
                'JPEG',
                0, // x
                0, // y
                imgWidth,
                Math.min(imgHeight, pageHeight),
                undefined,
                'MEDIUM' // Better quality
            );

        } finally {
            this.cleanupWrapper(wrapper);
        }
    }

    private cleanupWrapper(wrapper: HTMLElement): void {
        if (wrapper?.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
    }

    private showLoadingIndicator(): HTMLElement {
        const loader = document.createElement('div');
        loader.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: grey;
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 9999;
      ">
        <div>Generating PDF...</div>
      </div>
    `;
        document.body.appendChild(loader);
        return loader;
    }

    private hideLoadingIndicator(loader: HTMLElement): void {
        if (loader?.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }

    private cleanupTemporaryElements(): void {
        const tempElements = document.querySelectorAll('[data-temp-pdf]');
        tempElements.forEach(element => element.remove());
    }
}