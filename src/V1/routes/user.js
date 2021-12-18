const UserController = require("../controllers/userDB");
const AuthorizationMiddleware = require("../middleware/Authorization");
const JWTMiddleWare = require("../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

/**
 * @swagger
 * /user/backoffice-authorization:
 *  get:
 *      tags:
 *         - User
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: User is authorized
 *          400:
 *              $ref: '#/components/responses/ErrorJWT' 
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          500:
 *              description: Server error
 *
 */
router.get("/backoffice-authorization", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, (req, res) => {res.sendStatus(200)}) //autorisation pour accéder au backoffice

/**
 * @swagger
 * /user/:
 *  get:
 *      tags:
 *         - User
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
 *              $ref: '#/components/responses/UserFound'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/UserBadParams'
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
router.get("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.getAllUsers);

/**
 * @swagger
 * /user/count:
 *  get:
 *      tags:
 *         - User
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
 *              $ref: '#/components/responses/UserNumberFound'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/UserBadParams'
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
router.get("/count", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.getUsersCount);

/**
 * @swagger
 * /user/{id}:
 *  get:
 *      tags:
 *         - User
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - name: id
 *            description: User ID
 *            in: path
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/UserFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT' 
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAuthorizedOnRoute'
 *          404:
 *              description: Order not found
 *          500:
 *              description: Server error
 *
 */
router.get("/:id", JWTMiddleWare.identification, UserController.getUserById);


/**
 * @swagger
 * /user/:
 *  patch:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/UserUpdated'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/UserBadJSONBody'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAuthorizedOnRoute'
 *          404:
 *              description: No user found or related references not found
 *          409:
 *              $ref: '#/components/responses/UserAlreadyExist'
 *          500:
 *              description: Server error
 *
 */
router.patch("/", JWTMiddleWare.identification, UserController.updateUser);

/**
 * @swagger
 * /user/:
 *  post:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/UserAdded'
 *          400:
 *              $ref: '#/components/responses/UserBadJSONBody'
 *          409:
 *              $ref: '#/components/responses/UserAlreadyExist'
 *          500:
 *              description: Server error
 *
 */
router.post("/", UserController.insertUser);

/**
 * @swagger
 * /user/login:
 *  post:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToLogin'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/UserLogged'
 *          400:
 *              $ref: '#/components/responses/UserBadJSONBody'
 *          404:
 *              description: User not found
 *          500:
 *              description: Server error
 *
 */
router.post("/login", UserController.login);

/**
 * @swagger
 * /user:
 *  delete:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToDelete'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/UserDeleted'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              description: You must be an administrator or the user can not be deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/mustBeAdmin'
 *                              - $ref: '#/components/responses/UserDeleteErrorEntityRelated'
 *          404:
 *              description: No order found
 *          500:
 *              description: Erreur serveur
 */
router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.deleteUser);

module.exports = router;