"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.checkout = exports.getProductID = exports.getAllProducts = void 0;
const product_1 = require("../../model/product");
function getAllProducts(req, res) {
    try {
        const searchQuery = req.query.search;
        if (searchQuery) {
            const stringQ = searchQuery.toString();
            const result = (0, product_1.getProductBySearchTerm)(stringQ);
            return res.status(200).json(result);
        }
        const result = (0, product_1.listProductsAll)();
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ error: error.toString() });
    }
}
exports.getAllProducts = getAllProducts;
function getProductID(req, res) {
    try {
        const product = req.params.id;
        const productId = parseInt(product);
        const result = (0, product_1.getProductByID)(productId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}
exports.getProductID = getProductID;
function checkout(req, res) {
    try {
        //do something
    }
    catch (_a) {
        //do something else
    }
}
exports.checkout = checkout;
function login(req, res) {
    try {
        //do something
    }
    catch (_a) {
        //do something else
    }
}
exports.login = login;
