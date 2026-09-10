import './globals.css';
import './design-system.css';
import './product-pages.css';

export const metadata={
  title:'ORBIT — Personal Data Operating System',
  description:'حوّل ملفاتك المبعثرة إلى نظام بيانات قابل للبحث والتحليل والربط والأتمتة.',
  applicationName:'ORBIT'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ar" dir="rtl" suppressHydrationWarning><body>{children}</body></html>;
}
