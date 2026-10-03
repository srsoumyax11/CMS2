import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML element for web builds.
 * It will not be rendered on native iOS/Android.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="description" content="Campus7 - NextGen College Management & Smart Hostel Platform" />
        <title>Campus7 - Smart Campus Portal</title>

        {/* 
          Disable body scrolling on web to match native mobile feel,
          and provide smooth dark mode canvas background.
        */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveWebStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveWebStyles = `
body {
  background-color: #0F172A;
  color: #F8FAFC;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
@media (prefers-color-scheme: light) {
  body {
    background-color: #F8FAFC;
    color: #0F172A;
  }
}
`;
