const categoryController = require("../controllers/categoryDB");
const AuthorizationMiddleware = require("../middleware/Authorization");
const JWTMiddleWare = require("../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

/**
 * @swagger
 * /category/:
 *  get:
 *      tags:
 *         - Category
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
 *              $ref: '#/components/responses/CategoriesFound'
 *          400:
 *              $ref: '#/components/responses/CategoryBadParams'
 *          404:
 *              description: No category found
 *          500:
 *              description: Server error
 *
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /category/count:
 *  get:
 *      tags:
 *         - Category
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
 *              $ref: '#/components/responses/CategoryNumberFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: Not found
 *          500:
 *              description: Server error
 *
 */
router.get("/count", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.getCategoryCount);

/**
 * @swagger
 * /category/{id}:
 *  get:
 *      tags:
 *         - Category
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - name: id
 *            description: category ID
 *            in: path
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/CategoryFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT' 
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          404:
 *              description: Category not found
 *          500:
 *              description: Server error
 *
 */
router.get("/:id", JWTMiddleWare.identification, categoryController.getCategoryById);

/**
 * @swagger
 * /category/:
 *  patch:
 *      tags:
 *          - Category
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/CategoryToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/CategoryUpdated'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/CategoryBadJSONBody'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: No category found
 *          409:
 *              $ref: '#/components/responses/CategoryAlreadyExist'
 *          500:
 *              description: Server error
 *
 */
router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.updateCategory);

/**
 * @swagger
 * /category/:
 *  post:
 *      tags:
 *          - Category
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/CategoryToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/CategoryAdded'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/CategoryBadJSONBody'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          409:
 *              $ref: '#/components/responses/CategoryAlreadyExist'
 *          500:
 *              description: Server error
 *
 */
router.post("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.insertCategory);

/**
 * @swagger
 * /category:
 *  delete:
 *      tags:
 *          - Category
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/CategoryToDelete'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/CategoryDeleted'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: No category found
 *          500:
 *              description: Erreur serveur
 *
 */
router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.deleteCategory);

module.exports = router;