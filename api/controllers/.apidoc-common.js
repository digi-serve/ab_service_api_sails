// No code here, just @apiDoc comments to define reusable blocks
// --- Permissions ---
/**
 * @apiDefine User user
 * Any authenticated user
 */
/**
 * @apiDefine Builder builder
 * A user with either the Builder or System Builder role
 */
/**
 * @apiDefine Switcheroo switcheroo
 * A user with the Switcheroo role
 */
//--- Params ---
/**
 * @apiDefine objID objID param
 * @apiParam {string} objID uuid of the ABObject
 */
/**
 * @apiDefine email
 * @apiBody {string} email user email
 */
/**
 * @apiDefine password
 * @apiBody {string} password user password
 */
/**
 * @apiDefine tenantO Optional Tenant
 * @apiBody {string} [tenant] tenant key
 */
/**
 * @apiDefine defID
 * @apiParam {string} ID uuid of the definition
 */
/**
 * @apiDefine download
 * @apiQuery {number|boolean} [download] whether to return the export
 * as a file download
 */
/**
 * @apiDefine timerID
 * @apiParam {string} ID uuid of a trigger timer
 */
// --- Responses ---
/**
 * @apiDefine successRes
 * @apiSuccess  (200) {string} status `"success"`
 */
/**
 * @apiDefine resTrue
 * @apiSuccess (200) {string} status `"success"`
 * @apiSuccess (200) {boolean} data `true`
 */
/**
 * @apiDefine resDone
 * @apiSuccess (200) {string} status `"success"`
 * @apiSuccess (200) {object} data
 * @apiSuccess (200) {boolean} data.done `true`
 */
/**
 * @apiDefine exportRes
 * @apiSuccess (200) {json} definitions
 */
// --- Groups ---
/**
 * @apiDefine Test test
 * These routes are only available when running in test mode.
 */