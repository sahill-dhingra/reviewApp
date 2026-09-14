# AI Review Assistant

A mobile-first customer feedback application that helps businesses collect genuine customer feedback and turn it into an editable Google review draft using AI.

## 🚀 MVP

The current MVP provides a simple flow for businesses and their customers:

1. A business is added manually to the database.
2. A review link is created for that specific business.
3. A QR code can be created/shared manually using the review link.
4. Customers scan the QR code or open the review link.
5. Customers provide feedback through a short questionnaire.
6. AI generates a review based only on the customer's feedback.
7. Customers can review and edit the generated text.
8. Customers copy the review and continue to the business's Google review page.
9. The customer manually posts the review on Google.

The application does **not** automatically post reviews or interact with Google's review interface.

## ✨ Features

- Business-specific review pages
- QR/link-based customer access
- Category-specific feedback questions
- Customer rating collection
- Positive feedback collection
- Improvement/issue collection
- AI-generated review drafts
- Editable review text
- Copy review functionality
- Direct link to the business's Google review page
- Review session storage
- Mobile-first responsive UI

## 🏗️ Current Business Setup

Businesses are currently added manually through the Supabase database.

Each business contains information such as:

- Business name
- Business category
- Phone number
- Google review URL



Category-specific questionnaire options are stored separately in the database, allowing different types of businesses to have different feedback questions.

## 🔄 Customer Flow

```text
QR Code / Review Link
        ↓
Business Review Page
        ↓
Give Rating
        ↓
What Did You Like?
        ↓
What Could Be Improved?
        ↓
AI Generates Review
        ↓
Customer Reviews / Edits Text
        ↓
Copy Review
        ↓
Continue to Google
        ↓
Customer Manually Posts Review
