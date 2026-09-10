export type SupportedAutomationTrigger='RECORD_CREATED'|'IMPORT_COMPLETED'|'ASSISTANT_PROPOSAL';
export type SupportedAutomationAction='AUDIT_LOG'|'WEBHOOK'|'REVIEW_REQUIRED';

export function inferAutomationRule(request:string,collectionId:string|null){
 const q=request.toLowerCase();
 let trigger:SupportedAutomationTrigger='ASSISTANT_PROPOSAL';
 if(/سجل جديد|ينضاف سجل|record created|new record|new row/.test(q))trigger='RECORD_CREATED';
 else if(/رفع ملف|استيراد|import completed|upload completed|يكتمل رفع/.test(q))trigger='IMPORT_COMPLETED';
 let action:SupportedAutomationAction='REVIEW_REQUIRED';
 if(/webhook|ويب هوك|نظام ثاني|external system/.test(q))action='WEBHOOK';
 else if(/audit|سجل الحدث|النشاط|activity log/.test(q))action='AUDIT_LOG';
 const executable=trigger!=='ASSISTANT_PROPOSAL'&&action!=='REVIEW_REQUIRED';
 return {
  trigger:{type:trigger,...(collectionId?{collectionId}:{})},
  actions:executable?[{type:action}]:[{type:'REVIEW_REQUIRED',request}],
  executable,
  reason:executable?null:'الطلب يحتاج إعداد أو إجراء غير مدعوم تلقائيًا حتى الآن، لذلك حفظته للمراجعة بدل ما أفترض تنفيذ غير موجود.'
 } as const;
}
