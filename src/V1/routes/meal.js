const mealController = require("../controllers/mealDB");
const AuthorizationMiddleware = require("../middleware/Authorization");
const JWTMiddleWare = require("../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    limits: {
        fileSize: 5000000 // 5MB
    },
    storage: storage
});
const fileSizeLimitErrorHandler = (err, req, res, next) => {
    if (err) {
      res.send(413)
    } else {
      next()
    }
  }


/**
 * @swagger
 * /meal/:
 *  get:
 *      tags:
 *         - Meal
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
 *              $ref: '#/components/responses/MealsFound'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/MealBadParams'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          404:
 *              description: No meal found
 *          500:
 *              description: Server error
 *
 */
router.get("/", JWTMiddleWare.identification, mealController.getAllMeals);

/**
 * @swagger
 * /meal/count:
 *  get:
 *      tags:
 *         - Meal
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
 *              $ref: '#/components/responses/MealNumberFound'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/MealBadParams'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          404:
 *              description: Not found
 *          500:
 *              description: Server error
 *
 */
router.get("/count", JWTMiddleWare.identification, mealController.getMealsCount);

/**
 * @swagger
 * /meal/{id}:
 *  get:
 *      tags:
 *         - Meal
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - name: id
 *            description: Meal ID
 *            in: path
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              $ref: '#/components/responses/MealFound'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT' 
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          404:
 *              description: Meal not found
 *          500:
 *              description: Server error
 *
 */
router.get("/:id", JWTMiddleWare.identification, mealController.getMealById);


/**
 * @swagger
 * /meal/:
 *  patch:
 *      tags:
 *          - Meal
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/MealToUpdate'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/MealUpdated'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/MealBadJSONBody'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAdmin'
 *          404:
 *              description: No meal found or related references not found
 *          413:
 *              description: File too large
 *          500:
 *              description: Server error
 *
 */
router.patch("/", JWTMiddleWare.identification, upload.fields([
    {name: 'image', maxCount: 1}
]),fileSizeLimitErrorHandler, AuthorizationMiddleware.mustBeAdmin, mealController.updateMeal);

/**
 * @swagger
 * /meal/:
 *  post:
 *      tags:
 *          - Meal
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/MealToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/MealAdded'
 *          400:
 *              description: JWT not valid or JSON body not correct
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/MealBadJSONBody'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              $ref: '#/components/responses/mustBeAuthorizedOnRoute'
 *          404:
 *              description: Related references not found
 *          413:
 *              description: File too large
 *          500:
 *              description: Server error
 *
 */
router.post('/', JWTMiddleWare.identification, upload.fields([
{name: 'image', maxCount: 1}
]),fileSizeLimitErrorHandler, AuthorizationMiddleware.mustBeAuthorizedToCreateMeal, mealController.insertMeal);

/**
 * @swagger
 * /meal:
 *  delete:
 *      tags:
 *          - Meal
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/MealToDelete'
 *      responses:
 *          204:
 *              $ref: '#/components/responses/MealDeleted'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              $ref: '#/components/responses/MissingJWT'
 *          403:
 *              description: You must be an administrator or the meal can not be deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/mustBeAdmin'
 *                              - $ref: '#/components/responses/MealDeleteErrorEntityRelated'
 *          404:
 *              description: No meal found
 *          500:
 *              description: Erreur serveur
 */
router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.deleteMeal);

module.exports = router;