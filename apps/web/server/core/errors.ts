export class AppError extends Error {
  constructor(public code:string, public status:number, message:string, public details?:unknown){super(message)}
}
export function errorResponse(error:unknown){
  if(error instanceof AppError)return Response.json({error:{code:error.code,message:error.message,details:error.details??null}},{status:error.status});
  if(error instanceof Error&&error.message==='UNAUTHORIZED')return Response.json({error:{code:'UNAUTHORIZED',message:'انتهت جلسة الدخول.'}},{status:401});
  if(error instanceof Error&&error.message==='FORBIDDEN')return Response.json({error:{code:'FORBIDDEN',message:'ما عندك صلاحية لهذا الإجراء.'}},{status:403});
  console.error(error);return Response.json({error:{code:'INTERNAL_ERROR',message:'صار خطأ داخلي غير متوقع.'}},{status:500});
}
