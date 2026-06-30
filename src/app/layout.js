import "./globals.css";

export const metadata = {
  title: "Feelings Quote Generator",
  description:
    "Describe how you feel and get share-ready quotes for WhatsApp Status and Instagram Stories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
