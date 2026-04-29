export const metadata = {
  title: "RM Agent — GRIDGE CRM",
  description: "IT 리소스 매칭 CRM v2 (Next.js + SQLite)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
