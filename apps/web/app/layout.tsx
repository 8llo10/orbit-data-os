import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/primitives.css';
import '../styles/shell.css';

import '../styles/components/assistant-spotlight.css';
import '../styles/components/copilot.css';
import '../styles/components/dashboard-builder.css';

import '../styles/pages/auth.css';
import '../styles/pages/dashboard.css';
import '../styles/pages/assistant.css';
import '../styles/pages/imports.css';
import '../styles/pages/collections.css';
import '../styles/pages/search.css';
import '../styles/pages/automations.css';
import '../styles/pages/graph.css';
import '../styles/pages/developer.css';
import '../styles/pages/settings.css';
import '../styles/pages/activity.css';
import '../styles/pages/error.css';

export const metadata={
  title:'ORBIT — Personal Data Operating System',
  description:'حوّل ملفاتك المبعثرة إلى نظام بيانات قابل للبحث والتحليل والربط والأتمتة.',
  applicationName:'ORBIT'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ar" dir="rtl" suppressHydrationWarning><body>{children}</body></html>;
}
