Here is a design document based on the two inspiration images provided. You can pass this to Cursor to reference for generating new components and pages with a consistent design system.

---

## **Design System Document**

This document outlines the design system based on the "App UI" and "Landing Page" inspiration files.

### **1\. Guiding Principles**

* **Minimal & Clean:** The design is uncluttered, spacious, and modern.  
* **Typography-Driven:** A strong, clear typographic hierarchy is the primary design element.  
* **Monochromatic Focus:** The core palette is black, white, and shades of grey. Color is used sparingly, if at all.  
* **Generous Spacing:** Use ample white space (padding and margins) to create a breathable, uncluttered layout.

### **2\. Core Design Themes**

The provided images show two distinct, but related, visual themes. Apply them based on the context:

1. **"Web/Landing Page" Theme (High-Contrast):**  
   * **Appearance:** Opaque, high-contrast, and section-based.  
   * **Backgrounds:** Uses solid blocks of pure white (\#FFFFFF) and dark charcoal/black (\#121212 or \#1A1A1A) to define sections.  
   * **Use Case:** Ideal for marketing websites, landing pages, and content-heavy layouts.  
2. **"App/UI" Theme (Glassmorphism):**  
   * **Appearance:** Soft, layered, and translucent.  
   * **Backgrounds:** Uses a light, subtle gradient (e.g., light lavender/grey like \#F7F7F9).  
   * **Key Element:** UI containers (like modals, app windows, or cards) are "glass"—they have a semi-transparent white background, a backdrop-filter: blur(), a soft border, and a gentle shadow.  
   * **Use Case:** Ideal for desktop applications, modals, dashboards, and focused UI elements.

### **3\. Color Palette**

Use this simple, high-contrast palette.

| Token | Value | Description |
| :---- | :---- | :---- |
| bg-primary | \#FFFFFF | Primary background (e.g., web sections, cards). |
| bg-secondary | \#F7F7F9 | Lightest grey (e.g., app background). |
| bg-inverse | \#121212 | Dark background (e.g., dark web sections, primary buttons). |
| text-primary | \#1A1A1A | Main text, headings (on light backgrounds). |
| text-secondary | \#6B6B6B | Subtext, placeholder text, body copy. |
| text-inverse | \#FFFFFF | All text on bg-inverse. |
| border-primary | \#E0E0E0 | Subtle borders for cards and inputs. |
| border-glass | rgba(255, 255, 255, 0.2) | Border color for glassmorphism elements. |

### **4\. Typography**

* **Font Family:** Use a modern, geometric sans-serif font.  
  * **CSS:** font-family: 'Inter', \-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;  
* **Typographic Scale:**  
  * **H1 (Page Title):** font-size: 48px; font-weight: 700; (e.g., "Where Money Grows")  
  * **H2 (Section Head):** font-size: 36px; font-weight: 700; (e.g., "What would you like to know?")  
  * **H3 (Sub-section):** font-size: 24px; font-weight: 600; (e.g., "Use cases")  
  * **Body:** font-size: 16px; font-weight: 400; color: var(--text-secondary);  
  * **Subtext/Caption:** font-size: 14px; font-weight: 400; color: var(--text-secondary); (e.g., "Use one of the most common prompts...")

### **5\. Layout & Spacing**

* **Base Unit:** Use an **8px grid** for all spacing (margins, padding).  
* **Standard Gaps:**  
  * Component-internal padding (e.g., inside a card): 16px (2 units) or 24px (3 units).  
  * Gaps between elements: 24px (3 units) or 32px (4 units).  
  * Section padding (top and bottom): 64px (8 units) or 96px (12 units).  
* **Layout:** Content should be centered with a maximum width (e.g., 1100px) for web pages.

### **6\. Components**

#### **Buttons**

* **Primary Button (Web Theme):**  
  * **Background:** var(--bg-inverse)  
  * **Text:** var(--text-inverse)  
  * **Border Radius:** 8px  
  * **Padding:** 12px 24px  
  * **Font:** font-weight: 500; font-size: 16px;  
* **Icon Button (App Theme):**  
  * A simple icon (see Iconography) inside a circular or rounded-square container.

#### **Cards**

* **Web Card (High-Contrast):**  
  * **Background:** var(--bg-primary)  
  * **Border:** 1px solid var(--border-primary)  
  * **Border Radius:** 12px  
  * **Box Shadow:** 0 4px 8px rgba(0, 0, 0, 0.02) (very-subtle)  
* **App Card (Glassmorphism):**  
  * **Background:** rgba(255, 255, 255, 0.7) (adjust opacity as needed)  
  * **Backdrop Filter:** backdrop-filter: blur(10px);  
  * **Border:** 1px solid var(--border-glass)  
  * **Border Radius:** 16px  
  * **Box Shadow:** 0 8px 16px rgba(0, 0, 0, 0.05) (soft and diffuse)

#### **Input Fields**

* **App Input (Bottom Bar):**  
  * **Style:** Pill-shaped or highly rounded rectangle.  
  * **Border Radius:** 24px or 999px  
  * **Border:** 1px solid var(--border-primary)  
  * **Background:** var(--bg-primary)  
  * **Inside:** Icon on the left, placeholder text (color: var(--text-secondary);).

### **7\. Iconography**

* **Style:** Use minimal, lightweight, **line-art (stroke-based)** icons.  
* **Weight:** stroke-width: 1.5 or 2\.  
* **Color:** var(--text-secondary) or var(--text-primary) depending on emphasis.