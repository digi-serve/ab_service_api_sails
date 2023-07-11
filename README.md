[![E2E Tests](https://github.com/digi-serve/ab_service_api_sails/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/digi-serve/ab_service_api_sails/actions/workflows/e2e-tests.yml) [![build-on-commit](https://github.com/digi-serve/ab_service_api_sails/actions/workflows/build-on-commit.yml/badge.svg)](https://github.com/digi-serve/ab_service_api_sails/actions/workflows/build-on-commit.yml)

# AppBuilder API v2.0.0

The api endpoint for our AppBuilder Runtime.

___

## Reference
<a name="top"></a>
- [AppBuilder](#AppBuilder)
  - [CSV Export](#CSV-Export)
  - [Model Count](#Model-Count)
  - [Model Create](#Model-Create)
  - [Model Create Batch](#Model-Create-Batch)
  - [Model Delete](#Model-Delete)
  - [Model Find](#Model-Find)
  - [Model Update](#Model-Update)
  - [Model Update Batch](#Model-Update-Batch)
- [Auth](#Auth)
  - [Login](#Login)
  - [Logout](#Logout)
  - [Reset Password](#Reset-Password)
  - [Reset Verification](#Reset-Verification)
  - [Set Password](#Set-Password)
  - [Switcheroo](#Switcheroo)
  - [Switcheroo Clear](#Switcheroo-Clear)
- [Definition](#Definition)
  - [All Applications](#All-Applications)
  - [Check](#Check)
  - [Create](#Create)
  - [Delete](#Delete)
  - [Export All](#Export-All)
  - [Export App](#Export-App)
  - [Import](#Import)
  - [Register](#Register)
  - [Update](#Update)
  - [Update App accross Tenant](#Update-App-accross-Tenant)
  - [User Applications](#User-Applications)
- [File](#File)
  - [Get a File](#Get-a-File)
  - [Upload](#Upload)
- [Log](#Log)
  - [Find](#Find)
- [Multilingual](#Multilingual)
  - [Missing Label](#Missing-Label)
- [Process](#Process)
  - [External Done](#External-Done)
  - [Inbox Find](#Inbox-Find)
  - [Inbox Metadata](#Inbox-Metadata)
  - [Inbox Register](#Inbox-Register)
  - [Inbox Update](#Inbox-Update)
  - [Task Reset](#Task-Reset)
  - [Timer Start](#Timer-Start)
  - [Timer Status](#Timer-Status)
  - [Timer Stop](#Timer-Stop)
- [Relay](#Relay)
  - [QR Code](#QR-Code)
- [Report](#Report)
  - [View](#View)
  - [~~Well Invoice~~](#Well-Invoice)
  - [~~Well Receipt~~](#Well-Receipt)
- [Tenant](#Tenant)
  - [Add](#Add)
- [Test](#Test)
  - [Import](#Import)
  - [Reset](#Reset)

___


<a name='AppBuilder'></a> 
## AppBuilder


  
<a name='CSV-Export'></a>
### CSV Export - `GET` /appbuilder/csv-export/:viewID
[Back to top](#top)


**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| viewID | `string` | route |  |
| where | `string` | query | **optional**  |
  
<a name='Model-Count'></a>
### Model Count - `GET` /app_builder/model/:objID/count
[Back to top](#top)


<p>Perform a Count operation on the data managed by a specified ABObject. This returns a count of all the matching rows specified by the <code>{where}</code> parameter.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| objID | `string` | route | <p>uuid of the ABObject</p> |
| where | `object` | query | <p>filter conditions to apply before counting</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.count | `number` | <p>count of all the matching rows</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Model-Create'></a>
### Model Create - `POST` /app_builder/model/:objID
[Back to top](#top)


<p>Perform a Create operation on the data managed by a specified ABObject. This returns a fully populated row value of the newly created entry.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| objID | `string` | route | <p>uuid of the ABObject</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` | <p>populated row value of the newly created entry</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Model-Create-Batch'></a>
### Model Create Batch - `POST` /app_builder/model/:objID/batch
[Back to top](#top)


<p>Perform a Create operation on a batch of data managed by a specified ABObject. This returns a fully populated row value of the newly created entry.</p> <p>NOTE: the incoming data contains an .id value used on the client to identify the entry.  This is not part of the data being stored, but a local reference. Our return data references this .id to update the client with the results for that entry.</p>

#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| objID | `string` | route | <p>uuid of the ABObject to add to</p> |
| batch | `array` | body | <p>records to add</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.data | `object` | <p>entries that added successfully <code>{ id: rowEntry }</code></p> |
| data.errors | `object` | <p>entries that could not be saved <code>{ id: error }</code></p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Model-Delete'></a>
### Model Delete - `DELETE` /app_builder/model/:objID/:ID
[Back to top](#top)


<p>Perform a Delete operation on the data managed by a specified ABObject.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| objID | `string` | route | <p>The uuid of the ABObject that the record to delete belongs to</p> |
| ID | `string` | route | <p>The uuid of the record to delete</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.numRows | `number` | <p>The # of rows effected by our delete operation</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Model-Find'></a>
### Model Find - `GET` /app_builder/model/:objID
[Back to top](#top)


<p>Perform a Find operation on the data managed by a specified ABObject.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| objID | `string` | route | <p>The uuid of the ABObject</p> |
| where | `object` | query | **optional** <p>filter conditions</p> |
| sort | `array` | query | **optional** <p>specify the fields used for sorting <code>[ { key: field.id, dir:[&quot;ASC&quot;, &quot;DESC&quot;]}, ... ]</code></p> |
| populate | `boolean\|array` | query | **optional** <p>return values with their connections populated?</p> |
| offset | `number` | query | **optional** <p>the number of entries to skip.</p> |
| limit | `number` | query | **optional** <p>the number of return.</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.data | `array` | <p>all the matching rows</p> |
| data.total_count | `number` | <p>count of the returned rows (for pagination)</p> |
| data.pos | `number` | <p>starting position (for pagination)</p> |
| data.offset | `number` |  |
| data.limit | `number` |  |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Model-Update'></a>
### Model Update - `PUT` /app_builder/model/:objID/:id
[Back to top](#top)


<p>Perform an Update operation on the data managed by a specified ABObject. This returns a fully populated row value of the newly created entry.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>uuid of the record</p> |
| objID | `string` | route | <p>uuid of the ABObject</p> |
| ...params | `any` | body | <p>any values to update, based on the ABObject's columns</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` | <p>row value</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Model-Update-Batch'></a>
### Model Update Batch - `PUT` /app_builder/batch/model/:objID
[Back to top](#top)


<p>Perform an Update operation on a batch of data managed by a specified ABObject.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| objID | `string` | route | <p>uuid of the ABObject</p> |
| rowIds | `string[]` | body | <p>uuids of the records to update</p> |
| values | `object` | body | <p>values to update</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
| data | `boolean` | <p><code>true</code></p> |

<a name='Auth'></a> 
## Auth


  
<a name='Login'></a>
### Login - `POST` /auth/login
[Back to top](#top)


<p>Process the provided login email/password and establish a user session if valid.</p>

**Permission:** `None`

#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| email | `string` | body | <p>user email</p> |
| password | `string` | body | <p>user password</p> |
| tenant | `string` | body | **optional** <p>tenant key</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.user | `object` |  |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Logout'></a>
### Logout - `POST` /auth/logout
[Back to top](#top)


<p>Clears the session and redirects the user</p>

**Permission:** `None`

#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |

##### Success response - `200 CAS`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.redirect | `string` | <p>if using CAS Authentication we send the redirect url for logout</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Reset-Password'></a>
### Reset Password - `POST` /auth/login/reset
[Back to top](#top)


<p>Request an email to be sent to the user's address with a link to reset their password.</p>

**Permission:** `None`

#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| url | `string` | body |  |
| email | `string` | body | <p>user email</p> |
| tenant | `string` | body | **optional** <p>tenant key</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Reset-Verification'></a>
### Reset Verification - `POST` /auth/password/reset
[Back to top](#top)


<p>Authenticate the user with tokens and redirect to the reset password page, used in the reset password emails</p>

**Permission:** `None`

#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| t | `string` | query | <p>tenant ID</p> |
| a | `string` | query | <p>auth token</p> |
#### Responses

##### Success response - `302`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| redirect |  | <p>redirect to login page</p> |
  
<a name='Set-Password'></a>
### Set Password - `POST` /auth/password/reset
[Back to top](#top)


**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| password | `string` | body | <p>user password</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Switcheroo'></a>
### Switcheroo - `POST` /auth/switcheroo/:userID
[Back to top](#top)


<p>Validate a request to switcheroo to another user.</p>

**Permission:** `Switcheroo`
\- A user with the Switcheroo role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| userID | `string` | route | <p>user to switch to</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.switcherooID | `string` | <p>user switched to</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Switcheroo-Clear'></a>
### Switcheroo Clear - `DELETE` /auth/switcheroo
[Back to top](#top)


<p>Remove a switcheroo assignment.</p>

**Permission:** `None`

#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.success | `boolean` | <p><code>true</code></p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |

<a name='Definition'></a> 
## Definition


  
<a name='All-Applications'></a>
### All Applications - `GET` /definition/allapplications
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| definitions | `json` |  |
  
<a name='Check'></a>
### Check - `GET` /definition/check-update
[Back to top](#top)


<p>Check when the server last updated definitions. Used for cache busting <code>/definition/myapps</code></p>

**Permission:** `none`

#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `number` | <p>the result of <code>Date.now()</code> when definitions were updated</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Create'></a>
### Create - `POST` /definition/create
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| id | `string` | body | <p>a uuid</p> |
| name | `string` | body |  |
| type | `string` | body |  |
| json | `string` | body |  |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` | <p>complete definition</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Delete'></a>
### Delete - `DELETE` /definition/:ID
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>uuid of the definition</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Export-All'></a>
### Export All - `GET` /definition/export/all
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| download | `number\|boolean` | query | **optional** <p>whether to return the export as a file download</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| definitions | `json` |  |
  
<a name='Export-App'></a>
### Export App - `GET` /definition/export/:ID
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>uuid of the ABApplication</p> |
| download | `number\|boolean` | query | **optional** <p>whether to return the export as a file download</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| definitions | `json` |  |
  
<a name='Import'></a>
### Import - `POST` /definition/import
[Back to top](#top)


<p>Import definitions from an uploaded json file</p>

**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
| data | `object` |  |
| data.done | `boolean` | <p><code>true</code></p> |
  
<a name='Register'></a>
### Register - `POST` /definition/register
[Back to top](#top)


<p>Register for socket updates when definitons change</p>

**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Update'></a>
### Update - `PUT` /definition/:id
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>uuid of the definition</p> |
| ...params | `any` | body | <p>any values to update in the definition</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Update-App-accross-Tenant'></a>
### Update App accross Tenant - `POST` /definition/tenants-update-application
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| applicationUUID | `string` | body |  |
| state | `number` | body | <p>States { 0: create the file, 1: tranfer data of those keys, 2: done }</p>_Allowed values: 0,1,2_ |
| date | `date` | body |  |
| data | `string` | body | **optional**  |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='User-Applications'></a>
### User Applications - `GET` /definition/myapps
[Back to top](#top)


**Permission:** `none`

#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| definitions | `text/javascript` | <p>script to add the app defintions</p> |

<a name='File'></a> 
## File


  
<a name='Get-a-File'></a>
### Get a File - `GET` /file/:ID
[Back to top](#top)


**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>file uuid</p> |
#### Responses

##### Success response - `302`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| url | `redirect` | <p>to the file</p> |
  
<a name='Upload'></a>
### Upload - `POST` /file/upload/:objID/:fieldID
[Back to top](#top)


**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| fieldID | `string` | route |  |
| objID | `string` | route | <p>uuid of the ABObject</p> |
| isWebix | `string` | query | **optional**  |
| file_fullpath | `string` | query | **optional**  |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `Object` |  |
| data.uuid | `string` |  |
| data.status | `string` | <p><code>&quot;server&quot;</code> if using a webix uploader</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |

<a name='Log'></a> 
## Log


  
<a name='Find'></a>
### Find - `GET` /app_builder/object/:objID/track
[Back to top](#top)


<p>Request a series of log entries for the data managed by a specific ABObject.</p>

**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| objID | `string` | route | <p>uuid of the ABObject</p> |
| rowId | `string` | query | **optional** <p>The specific {row} entry we are looking for</p> |
| levelName | `string` | query | **optional** <p>the type of entries</p>_Allowed values: insert,update,delete_ |
| username | `string` | query | **optional** <p>entries by a specific username</p> |
| startDate | `date` | query | **optional** <p>entries between a specific time frame</p> |
| endDate | `date` | query | **optional** <p>entries between a specific time frame</p> |
| start | `number` | query | **optional** <p>paging option</p> |
| limit | `number` | query | **optional** <p>paging option</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object[]` | <p>log enteries</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |

<a name='Multilingual'></a> 
## Multilingual


  
<a name='Missing-Label'></a>
### Missing Label - `POST` /multilingual/label-missing
[Back to top](#top)


<p>report a missing label to add to the translations</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| labels | `string` | body | <p>JSON string that parses to an array of objects with keys, <code>key</code> and <code>altText</code></p> |

#### Parameters examples

`json` - Labels

```json
{ "labels": "[{\"key\":\"example\", \"altText\": \"example\"}]" }
```
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |

<a name='Process'></a> 
## Process


  
<a name='External-Done'></a>
### External Done - `POST` /process/external
[Back to top](#top)


<p>Allows an external approval task to report the task as done to continue the process.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| task | `object` | body |  |
| task.id | `string` | body | <p>id of the external approval task instance</p> |
| data | `object` | body | **optional** <p>any data to add to the process context</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Inbox-Find'></a>
### Inbox Find - `GET` /process/inbox/
[Back to top](#top)


<p>Get the inbox tasks for the current user</p>

**Permission:** `User`
\- Any authenticated user
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `Object[]` | <p>process tasks</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Inbox-Metadata'></a>
### Inbox Metadata - `POST` /process/inbox/meta
[Back to top](#top)


<p>Given a list of process ids, return a consolidated list of application-processes necessary for the UI to create the Inbox accordion</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ids | `string[]` | body | <p>process ids</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `Object[]` | <p>application and process metadata see example</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |

#### Success response example

##### Success response example - `200`

```json
[{
  "id": "cbf95e19-805b-4793-8d27-56c0c8c9449e",
  "translations": [{
    "language_code": "en"
    "label": "Site Administration",
    "description": "Manage access to the web site for our users"
  }],
  "processes": [
    {
       "id": "24cb6b33-3ac5-432b-a4ad-c9ae7f12367a",
       "translations": [{
         "language_code": "en",
         "label": "approve new Role"
       }]
    }
  ]
}]
```
  
<a name='Inbox-Register'></a>
### Inbox Register - `POST` /process/inbox/register
[Back to top](#top)


<p>Register for socket updates for realtime inbox updates</p>

**Permission:** `User`
\- Any authenticated user
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `string` | <p>&quot;ready&quot; or &quot;sockets not enabled, so no real time updates.&quot;</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Inbox-Update'></a>
### Inbox Update - `PUT` /process/inbox/:ID
[Back to top](#top)


<p>Complete an proces task from the inbox</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>id of the inbox task</p> |
| response | `string` | body | <p>response to send to the process</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Task-Reset'></a>
### Task Reset - `PUT` /process/reset/:taskID
[Back to top](#top)


<p>send a signal to reset a specific process &amp; task. This will cause that task to restart and run again.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| taskID | `string` | route | <p>uuid of the process task</p> |
| instanceID | `string/string[]` | body | <p>ids of process instances</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `number` | <p>the number of process resets</p> |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Timer-Start'></a>
### Timer Start - `PUT` /process/timer/:ID/start
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>uuid of a trigger timer</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Timer-Status'></a>
### Timer Status - `GET` /process/timer/:ID
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>uuid of a trigger timer</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` |  |
| data.isRunning | `boolean` |  |
| status | `string` | <p><code>&quot;success&quot;</code></p> |
  
<a name='Timer-Stop'></a>
### Timer Stop - `PUT` /process/timer/:ID/stop
[Back to top](#top)


**Permission:** `Builder`
\- A user with either the Builder or System Builder role
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| ID | `string` | route | <p>uuid of a trigger timer</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |

<a name='Relay'></a> 
## Relay


  
<a name='QR-Code'></a>
### QR Code - `GET` /relay/user-qr
[Back to top](#top)


<p>Get a QR code to register the PWA</p>

**Permission:** `User`
\- Any authenticated user
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| image | `image/png` | <p>QR Code</p> |

<a name='Report'></a> 
## Report


  
<a name='View'></a>
### View - `GET` /report/:key
[Back to top](#top)


<p>Get a custom report</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| key | `string` | route | <p>report to request</p> |
| params... | `any` | query | <p>additional params as required by the report</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| content | `text/html` | <p>the html report</p> |
  
<a name='Well-Invoice'></a>
### ~~Well Invoice - `GET` /custom_reports/well-invoice~~
[Back to top](#top)

**_Depreciated use <code>/report/well-invoice</code>_**
  
<a name='Well-Receipt'></a>
### ~~Well Receipt - `GET` /custom_reports/well-receipt~~
[Back to top](#top)

**_Depreciated use <code>/report/well-receipt</code>_**

<a name='Tenant'></a> 
## Tenant


  
<a name='Add'></a>
### Add - `POST` /tenant/add
[Back to top](#top)


**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| key | `string` | body | <p>Short identifier for the tenant (no spaces)</p> |
| title | `string` | body | <p>Full Tenant name</p> |
| authType | `string` | body | <p>Authentication method to use for the tenant's users</p>_Allowed values: "login","okta","cas"_ |
| username | `string` | body | <p>Username for the new tenant's admin user (will be created)</p> |
| password | `string` | body | <p>Password for the new admin user</p> |
| email | `string` | body | <p>Email of the new admin user</p> |
| url | `string` | body | <p>The tenants domain, must be a valid uri</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |

<a name='Test'></a> 
## Test
<p>These routes are only available when running in test mode.</p>

  
<a name='Import'></a>
### Import - `POST` /test/import
[Back to top](#top)


<p>Import definitions from a file already on the server.</p>

**Permission:** `User`
\- Any authenticated user
#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| file | `string` | body | <p>path to the file on the server</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
| data | `object` |  |
| data.done | `boolean` | <p><code>true</code></p> |
  
<a name='Reset'></a>
### Reset - `POST` /test/reset
[Back to top](#top)


<p>Broadcast to other services that they need to update definitions. Useful when we've made a change in the DB directly.</p>

**Permission:** `None`

#### Parameters
| Name     | Type       | Location    |  Description            |
|----------|------------|-------------|-------------------------|
| tenant | `string` | body | <p>tenant key</p> |
#### Responses

##### Success response - `200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `string` | <p><code>&quot;success&quot;</code></p> |
| data | `object` |  |
| data.done | `boolean` | <p><code>true</code></p> |

