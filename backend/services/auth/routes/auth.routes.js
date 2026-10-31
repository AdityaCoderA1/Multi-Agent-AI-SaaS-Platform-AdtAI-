import express from "express";

import {
    deductCredits,
 login,
 logout,
 updatePlan,
 updateInstructions
}
from "../controllers/auth.controllers.js";

const router =
express.Router();

router.post("/login",login);
router.get("/logout",logout);
router.patch(
    "/internal/update-plan",
    updatePlan
);
router.patch(

"/internal/deduct-credits",

deductCredits

);
router.patch("/internal/update-instructions", updateInstructions);


export default router;