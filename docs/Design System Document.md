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
   * **Backgrounds:** Uses a soft, full-screen gradient transitioning from pale lavender/light purplish-grey (hsl(270, 20%, 97%) or \#F5F3F7) at the top to light greyish-white (\#F9F9F9) at the bottom.  
   * **Key Element:** UI containers (like modals, app windows, or cards) are "glass"—they have a clean, solid off-white (\#FFFFFF) background with very subtle borders (\#EAEAEA) or soft, diffuse box shadows (0 4px 12px rgba(0, 0, 0, 0.03)) to make them "float" on the gradient.  
   * **Use Case:** Ideal for desktop applications, modals, dashboards, and focused UI elements.

### **3\. Color Palette**

Use this simple, high-contrast palette.

| Token | Value | Description |
| :---- | :---- | :---- |
| bg-primary | \#FFFFFF | Primary background (e.g., web sections, cards, inputs). |
| bg-secondary | \#F9F9F9 | Lightest grey (e.g., gradient end color). |
| bg-gradient-start | hsl(270, 20%, 97%) or \#F5F3F7 | Pale lavender/light purplish-grey (gradient start). |
| bg-inverse | \#121212 | Dark background (e.g., dark web sections, primary buttons). |
| text-primary | \#333333 | Main text, headings (dark charcoal grey). |
| text-secondary | \#888888 | Subtext, placeholder text, descriptive paragraphs (medium grey). |
| text-inverse | \#FFFFFF | All text on bg-inverse. |
| border-primary | \#EAEAEA | Very subtle, light grey borders for cards and inputs. |
| border-glass | rgba(255, 255, 255, 0.2) | Border color for glassmorphism elements. |
| shadow-subtle | 0 4px 12px rgba(0, 0, 0, 0.03) | Soft, diffuse box shadow for floating elements. |

### **4\. Typography**

* **Font Family:** Use a modern, geometric sans-serif font.  
  * **CSS:** font-family: 'Inter', \-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;  
* **Typographic Scale:**  
  * **H1 (Page Title):** font-size: 48px; font-weight: 600; color: var(--text-primary);  
  * **H2 (Section Head):** font-size: 36px; font-weight: 600; color: var(--text-primary);  
  * **H3 (Sub-section):** font-size: 24px; font-weight: 600; color: var(--text-primary);  
  * **Body:** font-size: 16px; font-weight: 400; color: var(--text-secondary);  
  * **Subtext/Caption:** font-size: 14px; font-weight: 400; color: var(--text-secondary);

### **5\. Layout & Spacing**

* **Base Unit:** Use an **8px grid** for all spacing (margins, padding).  
* **Standard Gaps:**  
  * Component-internal padding (e.g., inside a card): 16px (2 units) or 24px (3 units).  
  * Gaps between elements: 24px (3 units) or 32px (4 units).  
  * Section padding (top and bottom): 64px (8 units) or 96px (12 units).  
* **Layout:** Main container content should be centered with a maximum width (e.g., max-w-3xl in Tailwind, approximately 768px) for a spacious, uncluttered feel. Use generous padding and margins (e.g., p-8 or gap-6).

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
  * **Background:** var(--bg-primary) (\#FFFFFF)  
  * **Border:** 1px solid var(--border-primary) (\#EAEAEA)  
  * **Border Radius:** 12px  
  * **Box Shadow:** var(--shadow-subtle) (0 4px 12px rgba(0, 0, 0, 0.03))  
* **App Card (Glassmorphism):**  
  * **Background:** var(--bg-primary) (\#FFFFFF) - clean, solid off-white  
  * **Border:** 1px solid var(--border-primary) (\#EAEAEA) - very subtle, light grey  
  * **Border Radius:** 16px  
  * **Box Shadow:** var(--shadow-subtle) (0 4px 12px rgba(0, 0, 0, 0.03)) - soft, diffuse shadow to make cards "float" on the gradient

#### **Input Fields**

* **App Input (Bottom Bar):**  
  * **Style:** Pill-shaped or highly rounded rectangle.  
  * **Border Radius:** 24px or 999px  
  * **Border:** 1px solid var(--border-primary) (\#EAEAEA)  
  * **Background:** var(--bg-primary) (\#FFFFFF) - clean, solid off-white  
  * **Box Shadow:** var(--shadow-subtle) (0 4px 12px rgba(0, 0, 0, 0.03)) - to make input "float" on the gradient  
  * **Inside:** Icon on the left, placeholder text (color: var(--text-secondary); \#888888).

### **7\. Iconography**

* **Style:** Use minimal, lightweight, **line-art (stroke-based)** icons.  
* **Weight:** stroke-width: 1.5 or 2\.  
* **Color:** var(--text-secondary) or var(--text-primary) depending on emphasis.