const OrderController = require("../controllers/orderDB");
const AuthorizationMiddleware = require("../middleware/Authorization");
const JWTMiddleWare = require("../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;


/**
 * @swagger
 * /order/:
 *  get:
 *      tags:
 *         - Order
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - name: rowLimit
 *            description: Number of rows returned
 *            in: query
 *            required: false
 *            schema:
 *              type: integer
 *          - name: offset
 *            description: Offset from the first line
 *            in: query
 *            required: false
 *            schema:
 *              type: integer
 *          - name: searchElem
 *            description: Research element
 *            in: query
 *            required: false
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              $ref: '#/components/responses/OrderFound'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/OrderBadParams'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: No order found
 *          500:
 *              description: Server error
 *
 */
router.get("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.getAllOrders);

/**
 * @swagger
 * /order/count:
 *  get:
 *      tags:
 *         - Order
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - name: searchElem
 *            description: Research element
 *            in: query
 *            required: false
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              $ref: '#/components/responses/OrderNumberFound'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/OrderBadParams'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          404:
 *              description: Not found
 *          500:
 *              description: Server error
 *
 */
router.get("/count", JWTMiddleWare.identification, OrderController.getOrdersCount);

/**
 * @swagger
 * /order/{id}:
 *  get:
 *      tags:
 *         - Order
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - name: id
 *            description: Order ID
 *            in: path
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/OrderFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT' 
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          404:
 *              description: Order not found
 *          500:
 *              description: Server error
 *
 */
router.get("/:id", JWTMiddleWare.identification, OrderController.getOrderById);

/**
 * @swagger
 * /order/:
 *  patch:
 *      tags:
 *          - Order
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/OrderToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/OrderUpdated'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/OrderBadJSONBody'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: No order found or related references not found
 *          500:
 *              description: Server error
 *
 */
router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.updateOrder);


/**
 * @swagger
 * /order/:
 *  post:
 *      tags:
 *          - Order
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/OrderToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/OrderAdded'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/OrderBadJSONBody'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAuthorizedOnRoute'
 *          404:
 *              description: Related references not found
 *          409:
 *              $ref: '#/components/responses/MealAlreadyTaken'
 *          500:
 *              description: Server error
 *
 */
router.post("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAuthorizedToCreateOrder, OrderController.insertOrder);

/**
 * @swagger
 * /order:
 *  delete:
 *      tags:
 *          - Order
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/OrderToDelete'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/OrderDeleted'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              description: You must be an administrator or the order can not be deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/mustBeAdmin'
 *                              - $ref: '#/components/responses/OrderDeleteErrorEntityRelated'
 *          404:
 *              description: No order found
 *          500:
 *              description: Erreur serveur
 */
router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.deleteOrder);

module.exports = router;