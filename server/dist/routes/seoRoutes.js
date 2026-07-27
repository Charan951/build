"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seoController_1 = require("../controllers/seoController");
const router = (0, express_1.Router)();
router.get('/sitemap.xml', seoController_1.getSitemap);
router.get('/robots.txt', seoController_1.getRobots);
exports.default = router;
