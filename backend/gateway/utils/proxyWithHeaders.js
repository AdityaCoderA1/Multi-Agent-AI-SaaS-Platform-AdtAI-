import proxy from "express-http-proxy";

export const proxyWithUser =
(serviceUrl)=>{

 return proxy(
  serviceUrl,
  {
   limit: '50mb',
   proxyReqOptDecorator:
   (proxyReqOpts, srcReq)=>{

    if(srcReq.user){

      proxyReqOpts.headers[
       "x-user-id"
      ] =
      srcReq.user.userId;

      proxyReqOpts.headers[
       "x-user-email"
      ] =
      srcReq.user.email;
      proxyReqOpts.headers[
       "x-user-avatar"
      ] =
      srcReq.user.avatar;

      proxyReqOpts.headers[
       "x-user-custom-instructions"
      ] =
      srcReq.user.customInstructions ? Buffer.from(srcReq.user.customInstructions).toString("base64") : "";

    }

    return proxyReqOpts;

   }

  }
 );

}